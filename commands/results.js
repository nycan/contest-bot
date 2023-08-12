const { SlashCommandBuilder, ButtonBuilder, ActionRowBuilder } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

module.exports = {
    data: new SlashCommandBuilder().setName('results').setDescription('View the scoreboard for a contest.')
    .addStringOption(option =>option.setName('contest').setDescription('The contest to see the results of.').setRequired(true))
    .addBooleanOption(option =>option.setName('official-only').setDescription('Whether to only show official results. True by default.').setRequired(false)),
    async execute(interaction) {
        const contestCode = interaction.options.getString('contest');
        const officialOnly = interaction.options.getBoolean('official only');
        const contestFile = path.join(__dirname, '..','contests',contestCode+'.json');
        if(!fs.existsSync(contestFile)){
            await interaction.reply('Invalid contest code.');
            return;
        }
        const settings = require(path.join(__dirname, '..','settings.json'));
        const contestParam = require(contestFile);
        const member = await interaction.guild.members.fetch(interaction.user);
        if(Date.now() < new Date(contestParam.windowEnd) && !member._roles.includes(settings.adminRole)){
            await interaction.reply('You are not allowed to view the results of a contest that has not ended yet.');
            return;
        }
        let results = [];
        if(officialOnly || officialOnly === undefined){
            results = contestParam.submissions.filter(submission => submission.official)
            .sort((a, b) => parseFloat(b.score) - parseFloat(a.score));
        } else {
            results = contestParam.submissions
            .sort((a, b) => parseFloat(b.score) - parseFloat(a.score));
        }
        const nextPage = new ButtonBuilder()
            .setCustomId('nextPage').setLabel('Next Page').setStyle(1);
        const prevPage = new ButtonBuilder()
            .setCustomId('prevPage').setLabel('Previous Page').setStyle(1).setDisabled(true);
        const row = new ActionRowBuilder().addComponents(prevPage, nextPage);
        var lowerBound = 0;
        var upperBound = 10;
        var fields = [];
        for(var i = lowerBound; i < upperBound; i++){
            if(i >= results.length){
                break;
            }
            fields.push({
                name: String(i+1)+'. '+results[i].name,
                value: (results[i].score>=0)?results[i].score.toString():'Unscored',
            });
        }
        const embed = {
            color: 0xd10a0a,
            title: contestParam.name + ' Results',
            description: 'Page 1',
            fields: fields,
        };
        await interaction.reply({embeds: [embed], components: [row]});

        const collector = interaction.channel.createMessageComponentCollector({time: 300000});
        collector.on('collect', async r => {
            if(r.user.id != interaction.user.id){
                r.reply({content: 'Only the user who ran the command can interact with this.', ephemeral: true});
                return;
            }
            if(r.customId == 'nextPage'){
                lowerBound += 10;
                upperBound += 10;
                if(upperBound >= results.length){
                    nextPage.setDisabled(true);
                }
                if(lowerBound > 0){
                    prevPage.setDisabled(false);
                }
            } else {
                lowerBound -= 10;
                upperBound -= 10;
                if(lowerBound <= 0){
                    prevPage.setDisabled(true);
                }
                if(upperBound < results.length){
                    nextPage.setDisabled(false);
                }
            }
            fields = [];
            for(var i = lowerBound; i < upperBound; i++){
                if(i >= results.length){
                    break;
                }
                fields.push({
                    name: String(i+1)+'. '+results[i].name,
                    value: (results[i].score>=0)?results[i].score.toString():'Unscored',
                });
            }
            embed.fields = fields;
            embed.description = 'Page ' + (lowerBound/10 + 1).toString();
            r.update({embeds: [embed], components: [row]});
        });
    },
}