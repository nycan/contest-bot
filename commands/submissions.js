const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder().setName('submissions').setDescription('View your current submissions.'),
    async execute(interaction, dbclient) {
        await interaction.deferReply();
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
        fields = [];
        const contestParam = await dbclient.collection("contests").findOne({code: userParam.currContest});
        if(contestParam.longForm){
            fields = [{
                name: 'Submission',
                value: userParam.answers[0]
            }]
        } else {
            for(let i = 0; i < contestParam.numProblems; ++i){
                if(userParam.answers[i]){
                    fields.push({
                        name: 'Problem ' + (i+1),
                        value: String(userParam.answers[i]),
                    });
                } else {
                    fields.push({
                        name: 'Problem ' + (i+1),
                        value: 'Not submitted',
                    });
                }
            }
        }
        const embed = {
            title: 'Your Submissions',
            fields: fields,
            color: 0xd10a0a,
        };
        interaction.editReply({embeds: [embed], ephemeral: true});
    },
}