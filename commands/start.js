const { SlashCommandBuilder, ButtonBuilder, ActionRowBuilder } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

module.exports = {
    data: new SlashCommandBuilder().setName('start').setDescription('Write a given contest.')
    .addStringOption(option =>option.setName('name').setDescription('The code given for the contest.')),
    async execute(interaction) {
        contestCode = interaction.options.getString('name');

        const userFile = path.join(__dirname, '..', 'users', interaction.user.id+'.json');
        let userParam = {};
        if(fs.existsSync(userFile)){
            userParam = require(userFile);
        } else {
            userParam = {
                currContest: '',
                eligible: false,
                timerEnd: 0,
                completedContests: [],
            };
        }
        if(userParam.currContest != ''){
            await interaction.reply('You are already in a contest.');
            return;
        }
        const contestFile = path.join(__dirname, '..','contests',contestCode+'.json');
        console.log(contestFile);
        if(!fs.existsSync(contestFile)){
            await interaction.reply('Invalid contest code.');
            return;
        }
        const contestParam = require(contestFile);
        datetime = Date.now();
        if(new Date(contestParam.windowStart) > datetime){
            await interaction.reply('The contest has not started yet. It will start on ' + contestParam.windowStart.toString() + '.');
            return;
        }
        if(new Date(contestParam.windowEnd) < datetime){
            await interaction.reply('The contest has ended already. :(. It ended on ' + contestParam.windowEnd.toString() + '.');
            return;
        }
        if(contestParam.whitelist){
            if(!contestParam.list.includes(interaction.user.id)){
                await interaction.reply('You are not eligible for this contest.');
                return;
            }
        } else {
            if(contestParam.list.includes(interaction.user.id)){
                await interaction.reply('You are not eligible for this contest.');
                return;
            }
        }
        userParam.currContest = contestCode;

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
        fs.writeFileSync(userFile, JSON.stringify(userParam));
    },
}