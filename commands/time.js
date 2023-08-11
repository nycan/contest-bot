const { SlashCommandBuilder } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

module.exports = {
    data: new SlashCommandBuilder().setName('time').setDescription('Information about how much time is left.'),
    async execute(interaction) {
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
        const time = Date.now();
        const remaining = new Date(userParam.timerEnd - time);
        await interaction.reply({content:
            'You have ' + remaining.getUTCHours() + ' hours, ' + remaining.getUTCMinutes() + ' minutes, and ' + remaining.getUTCSeconds() + ' seconds left.',
        ephemeral: true});
    },
}