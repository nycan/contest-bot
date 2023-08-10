const { SlashCommandBuilder, ButtonBuilder, ActionRowBuilder } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

module.exports = {
    data: new SlashCommandBuilder().setName('start').setDescription('Write a given contest.')
    .addStringOption(option =>option.setName('name').setDescription('The code given for the contest.')),
    async execute(interaction) {
        const contestsPath = path.join(__dirname, '..','contests');
        const contestsFiles = fs.readdirSync(contestsPath).filter(file => file.endsWith('.js'));
        var contestParam = null;
        for(const file of contestsFiles){
            const filePath = path.join(contestsPath,file);
            const contest = require(filePath);
            if(contest.code == interaction.options.getString('name')){
                contestParam = contest;
                break;
            }
        }
        datetime = Date.now();
        if(contestParam == null){
            await interaction.reply('Invalid contest code.');
            return;
        }
        if(contestParam.windowStart > datetime){
            await interaction.reply('The contest has not started yet.');
            return;
        }
        if(contestParam.windowEnd < datetime){
            await interaction.reply('The contest has ended already. :(');
            return;
        }
        if(contestParam.whitelist){
            if(!contestParam.list.has(interaction.user.id)){
                await interaction.reply('You are not eligible for this contest.');
                return;
            }
        } else {
            if(contestParam.list.has(interaction.user.id)){
                await interaction.reply('You are not eligible for this contest.');
                return;
            }
        }

        const confirmEligibility = new ButtonBuilder()
            .setCustomId('confirmEligibility').setLabel('I\'m eligible for awards/recognition').setStyle(3);
        const cancelEligibility = new ButtonBuilder()
            .setCustomId('cancelEligibility').setLabel('I\'m not eligible').setStyle(4);
        const row = new ActionRowBuilder().addComponents(confirmEligibility, cancelEligibility);

        await interaction.user.send({
            content: contestParam.name + '\n' + contestParam.rules,
            components: [row],
        });
        await interaction.reply('Instructions have been sent to your DMs.');

    },
}