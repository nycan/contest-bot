const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder().setName('test').setDescription('testing the slash command'),
    async execute(interaction) {
        await interaction.reply('test');
    },
}