const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, Partials } = require('discord.js');
const { MongoClient } = require('mongodb');
require('dotenv').config()
token = process.env.DISCORD_TOKEN;
connection_string = process.env.MONGO_CONNECTION_STRING;

const client = new Client({ intents: [GatewayIntentBits.Guilds,GatewayIntentBits.DirectMessages], partials: [Partials.Channel] });
const db = new MongoClient(connection_string);

client.commands = new Collection();
const commandsPath = path.join(__dirname,'commands');
const commandsFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
for (const file of commandsFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

client.once(Events.ClientReady, c => {console.log(`Logged in as ${c.user.tag}`);});
client.login(token);

client.on(Events.MessageCreate, async message => {
	if(!message.content.startsWith('!')) return;
	if(message.content.startsWith('!submit')){
		const command = require('./commands/submitfile.js');
		await command.execute(message,dbclient);
	}
});

db.on('commandStarted', started => console.log(started));
const dbclient = db.db("contest-bot");

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	command.execute(interaction, dbclient).catch( (error) => {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	})
});

process.on('unhandledRejection', error => {
	console.error('Unhandled promise rejection:', error);
	fs.appendFile('log.txt', error.stack, () => {});
});

process.on('uncaughtException', error => {
	console.error('Uncaught exception:', error);
	fs.appendFile('log.txt', error.stack, () => {});
});

process.on("beforeExit", () => {
	db.close();
	client.destroy();
});