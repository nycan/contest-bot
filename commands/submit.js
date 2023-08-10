const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder().setName('template').setDescription('template'),
    async execute(interaction) {
        await interaction.reply('template');
    },
}