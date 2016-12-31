#!/usr/bin/env node

'use strict'

const fs = require('fs')
const chalk = require('chalk')
const cheerio = require('cheerio')
const got = require('got')
const limit = require('promise-limit')(10)

const $ = cheerio.load(fs.readFileSync('./emoji-page.html'))
const emojis = []

$('.emoji_row > td:first-child > span').each((index, el) => {
  const url = $(el).data('original')
  const segments = url.split('/')
  const ext = segments[segments.length - 1].split('.')[1]
  const name = segments[segments.length - 2] + `.${ext}`
  emojis.push({ name, url })
})

const stats = {
  skips: 0,
  errors: 0,
  successes: 0
}

Promise.all(emojis.map(emoji => {
  return limit(() => downloadOne(emoji))
})).then(() => {
  console.log(chalk.bold.cyan('Woohoo, we’re done! 🎉'))
  console.log(chalk.green(`• ${stats.successes} emoji downloaded to ./emoji/`))
  console.log(chalk.red(`• ${stats.errors} emoji failed to download`))
  console.log(chalk.cyan(`• ${stats.skips} emoji skipped (files already existed)`))
})

function downloadOne (emoji) {
  return new Promise((resolve, reject) => {
    const filename = `./emoji/${emoji.name}`
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
        console.log(chalk.bold.green(`Retrieved ${emoji.name}`))
        stats.successes++
        resolve()
      })
  })
}
