const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder().setName('submit').setDescription('Submit an answer.')
    .addStringOption(option =>option.setName('id').setDescription('The problem number.').setRequired(true))
    .addStringOption(option =>option.setName('answer').setDescription('Your answer to the problem.').setRequired(true)),
    async execute(interaction, dbclient) {
        await interaction.deferReply();
        id = interaction.options.getString('id');
        answer = interaction.options.getString('answer');
        if(interaction.channel.type != 1) {
            interaction.editReply('Please use this command in DMs.');
            return;
        }
        let userParam = await dbclient.collection("users").findOne({name: interaction.user.tag});
        if(!userParam){
            interaction.editReply('You are not in a contest.');
            return;
        }
        if(userParam.currContest == ''){
            interaction.editReply('You are not in a contest.');
            return;
        }
        if(userParam.timerEnd < Date.now()){
            interaction.editReply('Your time is up. However, you aren\'t supposed to see this message. Please contact an admin as this means that the bot likely crashed during your window.');
            return;
        }
        const contestParam = await dbclient.collection("contests").findOne({code: userParam.currContest});
        if(isNaN(id)){
            interaction.editReply({content: 'Invalid problem number.', ephemeral: true});
            return;
        }
        id = parseInt(id);
        if(id < 1 || id > contestParam.numProblems){
            interaction.editReply({content: 'Invalid problem number.', ephemeral: true});
            return;
        }
        if(contestParam.longForm){
            interaction.editReply({content: 'This is a long-form contest. Please use `!submit` and attach the file you are submitting.', ephemeral: true});
        } else {
            interaction.editReply({content: 'Your answer has been submitted.', ephemeral: true});
            userParam.answers[id-1] = answer;
            dbclient.collection("users").updateOne({name: interaction.user.tag}, {$set: userParam}, {upsert: true});
        }
    },
}