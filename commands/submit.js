const { SlashCommandBuilder } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

module.exports = {
    data: new SlashCommandBuilder().setName('submit').setDescription('Submit an answer.')
    .addStringOption(option =>option.setName('id').setDescription('The problem number.').setRequired(true))
    .addStringOption(option =>option.setName('answer').setDescription('Your answer to the problem.').setRequired(true)),
    async execute(interaction) {
        id = interaction.options.getString('id');
        answer = interaction.options.getString('answer');
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
        const contestFile = path.join(__dirname, '..','contests',userParam.currContest+'.json');
        const contestParam = require(contestFile);
        if(isNaN(id)){
            await interaction.reply('Invalid problem number.');
            return;
        }
        id = parseInt(id);
        if(id < 1 || id > contestParam.numProblems){
            await interaction.reply('Invalid problem number.');
            return;
        }
        await interaction.reply({content: 'Your answer has been submitted.', ephemeral: true});
        userParam.answers[id-1] = answer;
        fs.writeFileSync(userFile, JSON.stringify(userParam));
    },
}