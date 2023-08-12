const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

module.exports = {
    data: new SlashCommandBuilder().setName('submisions').setDescription('View your current submissions.'),
    async execute(interaction) {
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
        fields = [];
        const contestParam = require(path.join(__dirname, '..', 'contests', userParam.currContest+'.json'));
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
        const embed = {
            title: 'Your Submissions',
            fields: fields,
            color: 0xd10a0a,
        };
        await interaction.reply({embeds: [embed], ephemeral: true});
    },
}