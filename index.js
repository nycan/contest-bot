const { Client, Events, GatewayIntentBits } = require('discord.js');
require('dotenv').config()
token = process.env.DISCORD_TOKEN;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.once(Events.ClientReady, c => {console.log(`Logged in as ${c.user.tag}`);});
client.login(token);