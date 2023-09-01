const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder().setName('grade').setDescription('Grade a submission (admin-only).')
    .addStringOption(option =>option.setName('contest').setDescription('The contest to grade.').setRequired(true))
    .addStringOption(option =>option.setName('user').setDescription('The user to grade.').setRequired(true))
    .addNumberOption(option =>option.setName('score').setDescription('The score to give.').setRequired(true)),
    async execute(interaction, dbclient) {
        await interaction.deferReply();
        const contestCode = interaction.options.getString('contest');
        const user = interaction.options.getString('user');
        const score = interaction.options.getNumber('score');
        const settings = require('../settings.json');
        const member = await interaction.guild.members.fetch(interaction.user);
        if(!member._roles.includes(settings.adminRole)){
            interaction.editReply('This command is only for admins.');
            return;
        }
        const submission = await dbclient.collection("submissions").findOne({contest: contestCode, name: user});
        if(!submission){
            interaction.editReply('Invalid submission.');
            return;
        }
        submission.score = score;
        dbclient.collection("submissions").updateOne({contest: contestCode, name: user}, {$set: submission});
        interaction.editReply('Submission graded.');
    },
}