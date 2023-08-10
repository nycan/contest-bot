const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder().setName('start').setDescription('Write a given contest.'),
    async execute(interaction) {
        interaction.user.send("test");
        await interaction.reply('Instructions have been sent to your DMs.');
    },
}