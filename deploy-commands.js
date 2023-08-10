const fs = require('node:fs');
const path = require('node:path');
const { REST, Routes} = require('discord.js');
require('dotenv').config()
token = process.env.DISCORD_TOKEN;
client_id = process.env.DISCORD_CLIENT_ID;

const commandsPath = path.join(__dirname,'commands');
const commandsFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
const commands = [];
for (const file of commandsFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	if ('data' in command && 'execute' in command) {
		commands.push(command.data.toJSON());
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

const rest = new REST().setToken(token);
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		const data = await rest.put(
			Routes.applicationCommands(client_id),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		console.error(error);
	}
})();