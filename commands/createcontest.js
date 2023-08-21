const { SlashCommandBuilder, ButtonBuilder, ActionRowBuilder } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

module.exports = {
    data: new SlashCommandBuilder().setName('createcontest').setDescription('Create a contest.')
    .addStringOption(option =>option.setName('code').setDescription('The contest to see the results of.').setRequired(true))
    .addBooleanOption(option =>option.setName('official-only').setDescription('Whether to only show official results. True by default.').setRequired(false)),
    async execute(interaction) {
        const settings = require(path.join(__dirname, '..','settings.json'));
        const contestParam = require(contestFile);
        const member = await interaction.guild.members.fetch(interaction.user);
        if(Date.now() < new Date(contestParam.windowEnd) && !member._roles.includes(settings.adminRole)){
            await interaction.reply('You are not allowed to view the results of a contest that has not ended yet.');
            return;
        }
    },
}