Download all the custom emoji from a Slack.

You'll need a special Slack admin token for the workspace. To get it:

1. Go to your-workspace.slack.com/customize/emoji
2. Open devtools network panel and reload the page
3. Find the request to emoji.adminList
4. Find the token variable in the POST parameters (it should start with xoxs. this is a secret Slack admin token for secret Slack admin APIs)

Then install packages and run the script:

```bash
  yarn
  SLACK_TOKEN=xoxs.... node index.js
```

Thanks to Kara Brightwell for https://glitch.com/~ft-emoji-league, which this script is based on, and from where the token-finding instructions are cribbed.
