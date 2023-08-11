const { SlashCommandBuilder } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

module.exports = {
    data: new SlashCommandBuilder().setName('submisions').setDescription('View your current submissions.'),
    async execute(interaction) {
        id = interaction.options.getString('id');
        answer = interaction.options.getString('Answer');
        if(interaction.channel.type != 1) {
            await interaction.reply('Please use this command in DMs.');
            return;
        }
        const userFile = path.join(__dirname, '..', 'users', interaction.user.id+'.json');
        let userParam = {};
        if(fs.existsSync(userFile)){
            userParam = require(userFile);
        } else {
            await interaction.reply('You are not in a contest.');
        }
        if(userParam.currContest == ''){
            await interaction.reply('You are not in a contest.');
            return;
        }
        
    },
}