const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder().setName('submit').setDescription('Submit an answer.')
    .addStringOption(option =>option.setName('id').setDescription('The problem number.').setRequired(true))
    .addStringOption(option =>option.setName('answer').setDescription('Your answer to the problem.').setRequired(true)),
    async execute(interaction, dbclient) {
        id = interaction.options.getString('id');
        answer = interaction.options.getString('answer');
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
        const contestParam = await dbclient.collection("contests").findOne({code: userParam.currContest});
        if(isNaN(id)){
            await interaction.reply({content: 'Invalid problem number.', ephemeral: true});
            return;
        }
        id = parseInt(id);
        if(id < 1 || id > contestParam.numProblems){
            await interaction.reply({content: 'Invalid problem number.', ephemeral: true});
            return;
        }
        if(contestParam.longForm){
            await interaction.reply({content: 'This is a long-form contest. Please use `!submit <problem_id>` and attach the files you are submitting.', ephemeral: true});
        } else {
            await interaction.reply({content: 'Your answer has been submitted.', ephemeral: true});
            userParam.answers[id-1] = answer;
            dbclient.collection("users").updateOne({id: interaction.user.id}, {$set: userParam}, {upsert: true});
        }
    },
}