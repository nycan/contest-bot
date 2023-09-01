# Canada Math Discord Bot
Bot to run contests for Canada Math discord server

## Setup
1. Create a `.env` file with `DISCORD_TOKEN=<token>` and `DISCORD_CLIENT_ID=<client id>`.
2. Run `./setup.sh` to install dependencies and deploy commands.
3. Add your settings to `settings.json` in the format `{"adminRole": <your role id>, "debug": false}`.
4. Run `node index.js` to start the bot.