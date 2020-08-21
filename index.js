#!/usr/bin/env node

'use strict'

const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const got = require('got')
const fetch = require('node-fetch')
const limit = require('promise-limit')(50)

if (!process.env.SLACK_TOKEN) {
  console.log('Missing environment variable SLACK_TOKEN!')
  process.exit(1)
}

async function run() {
  const response = await fetch(`https://slack.com/api/emoji.adminList?token=${process.env.SLACK_TOKEN}&count=10000`)
  if (response.status !== 200) {
    console.error(response)
    return
  }

  const { emoji } = await response.json()

  const stats = {
    skips: 0,
    errors: 0,
    successes: 0
  }

  await Promise.all(
    emoji
      .filter(emoji => !emoji.is_alias)
      .map(emoji => limit(() => downloadOne(emoji)))
  )

  console.log(chalk.bold.cyan('Woohoo, we’re done! 🎉'))
  console.log(chalk.green(`• ${stats.successes} emoji downloaded to ./emoji/`))
  console.log(chalk.red(`• ${stats.errors} emoji failed to download`))
  console.log(chalk.cyan(`• ${stats.skips} emoji skipped (files already existed)`))

  function downloadOne (emoji) {
    return new Promise((resolve) => {
      const ext = path.extname(emoji.url)
      const filename = `./emoji/${emoji.name}${ext}`
      if (fs.existsSync(filename)) {
        stats.skips++
        resolve()
        return
      }

      got.stream(emoji.url).pipe(fs.createWriteStream(filename))
        .on('error', (error) => {
          console.error(chalk.bold.red(`Error retrieving ${emoji.name}`), error)
          stats.errors++
          resolve()
        })
        .on('close', () => {
          stats.successes++
          resolve()
        })
    })
  }
}

run()
