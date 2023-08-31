const { SlashCommandBuilder } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

module.exports = {
    data: new SlashCommandBuilder().setName('time').setDescription('Information about how much time is left.'),
    async execute(interaction,dbclient) {
        if(interaction.channel.type != 1) {
            await interaction.reply('Please use this command in DMs.');
            return;
        }
        let userParam = await dbclient.collection("users").findOne({id: interaction.user.id});
        if(!userParam){
            await interaction.reply('You are not in a contest.');
            return;
        }
        if(userParam.currContest == ''){
            await interaction.reply('You are not in a contest.');
            return;
        }
        if(userParam.timerEnd < Date.now()){
            await interaction.reply('Your time is up. However, you aren\'t supposed to see this message. Please contact an admin as this means that the bot likely crashed during your window.');
            return;
        }
        const time = Date.now();
        const remaining = new Date(userParam.timerEnd - time);
        await interaction.reply({content:
            'You have ' + remaining.getUTCHours() + ' hours, ' + remaining.getUTCMinutes() + ' minutes, and ' + remaining.getUTCSeconds() + ' seconds left.',
        ephemeral: true});
    },
}