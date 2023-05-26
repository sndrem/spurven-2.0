# Spurven 2.0

Dette er en omskriving av Spurven, en Slack-bot.
Rammeverket som brukes er [Bolt.js](https://slack.dev/bolt-js/tutorial/getting-started)

## Lokal utvikling

1. `npm install`
2. Installer ngrok om du ikke har det med `npm i -g ngrok`
3. I et terminal-vindu kjører du `nodemon ./src/index.ts`
4. I et annet terminal-vindu kjører du `ngrok http 3000` og så kopierer du http-url'en inn i Slack sin verifikasjons-input for bot'en.

## Deploy
For å deploye må du være logget inn på fly.io

1. `flyctl auth login`
2. `flyctl deploy --app spurven20 --local-only`
