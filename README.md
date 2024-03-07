# Math Contest Discord Bot
Discord bot to run math contests without leaving Discord.
Features include:
- Timed contests with individual windows
- Submissions in the format of simple answers or files
- Manual or automatic grading, user-defined
- Post-contest roles only available to users who have completed a contest

## Setup
1. Download the contents of the repository and go to the directory
2. Create a `.env` file in the main directory with `DISCORD_TOKEN=<token>`, `DISCORD_CLIENT_ID=<client id>` and `MONGO_CONNECTION_STRING=<mongodb connection string>`.
3. Run `./setup.sh` to install dependencies and deploy commands.
4. Add your settings to `settings.json` in the format `{"adminRole": <your role id>, "debug": false}`.
5. Run npm install and node deploy-commands.js
6. Run `node index.js` to start the bot.
