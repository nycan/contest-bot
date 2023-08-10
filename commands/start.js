const { SlashCommandBuilder } = require('discord.js');
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

        await interaction.user.send(contestParam.name + '\n' + contestParam.rules);
        await interaction.reply('Instructions have been sent to your DMs.');

    },
}