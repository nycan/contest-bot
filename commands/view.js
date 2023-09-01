const { SlashCommandBuilder, ButtonBuilder, ActionRowBuilder } = require('discord.js');
const path = require('node:path');

module.exports = {
    data: new SlashCommandBuilder().setName('view').setDescription('View the submissions for a contest (admin only).')
    .addStringOption(option =>option.setName('contest').setDescription('The contest to see the results of.').setRequired(true))
    .addBooleanOption(option =>option.setName('show-all').setDescription('Whether to show all results, not just official ones.').setRequired(false)),
    async execute(interaction, dbclient) {
        await interaction.deferReply();
        const contestCode = interaction.options.getString('contest');
        const showAll = interaction.options.getBoolean('show-all');
        const contestParam = await dbclient.collection("contests").findOne({code: contestCode});
        const subs = await dbclient.collection("submissions").find({contest: contestCode});
        if(!contestParam){
            interaction.reply('Invalid contest code.');
            return;
        }
        const settings = require(path.join(__dirname, '..','settings.json'));
        const member = await interaction.guild.members.fetch(interaction.user);
        if(!member._roles.includes(settings.adminRole)){
            interaction.editReply('This command is only for admins.');
            return;
        }
        if(!subs){
            interaction.reply('No submissions yet.');
            return;
        }
        const submissions = await subs.toArray();
        let results = [];
        if(showAll){
            results = submissions;
        } else {
            results = submissions.filter(submission => submission.official);
        }
        const nextPage = new ButtonBuilder()
            .setCustomId('nextPage').setLabel('Next Page').setStyle(1);
        if(results.length <= 10){
            nextPage.setDisabled(true);
        }
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
                name: results[i].name,
                value: (results[i].answers[0])?results[i].answers[0].toString():'No submission',
            });
        }
        const embed = {
            color: 0xd10a0a,
            title: contestParam.name + ' Submissions',
            description: 'Page 1',
            fields: fields,
        };
        interaction.editReply({embeds: [embed], components: [row]});

        const collector = interaction.channel.createMessageComponentCollector({time: 3600000});
        collector.on('collect', async r => {
            await r.deferUpdate();
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
                    name: results[i].name,
                    value: (results[i].answers[0])?results[i].answers[0].toString():'No submission',
                });
            }
            embed.fields = fields;
            embed.description = 'Page ' + (lowerBound/10 + 1).toString();
            r.editReply({embeds: [embed], components: [row]});
        });

        collector.on('end', async collected => {
            nextPage.setDisabled(true);
            prevPage.setDisabled(true);
            row.setComponents([prevPage, nextPage]);
            interaction.editReply({components: [row]});
        });
    },
}