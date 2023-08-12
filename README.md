# Canada Math Discord Bot
Bot to run contests for Canada Math discord server

## Setup
1. Run `./setup.sh` to install dependencies.
2. Create a `.env` file with `DISCORD_TOKEN=<token>` and `DISCORD_CLIENT_ID=<client id>`.
3. Add your settings to `settings.json` in the format `{"adminRole": <your role id>, "debug": false}`.
3. Run `node deploy-commands.js` to deploy the commands to the server.
4. Run `node index.js` to start the bot.