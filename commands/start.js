const { SlashCommandBuilder, ButtonBuilder, ActionRowBuilder, ComponentType, AttachmentBuilder } = require('discord.js');
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
                answers: [],
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
        answers = new Array(contestParam.problems.length).fill(0);
        fs.writeFileSync(userFile, JSON.stringify(userParam));

        const confirmEligibility = new ButtonBuilder()
            .setCustomId('confirmEligibility').setLabel('I\'m eligible for awards/recognition').setStyle(3);
        const cancelEligibility = new ButtonBuilder()
            .setCustomId('cancelEligibility').setLabel('I\'m not eligible').setStyle(4);
        const row = new ActionRowBuilder().addComponents(confirmEligibility, cancelEligibility);

        const startTimer = new ButtonBuilder()
            .setCustomId('startTimer').setLabel('Start my timer!').setStyle(1);
        const row2 = new ActionRowBuilder().addComponents(startTimer);

        const clicks = await interaction.user.send({
            content: contestParam.name + '\n' + contestParam.rules,
            components: [row],
        });
        await interaction.reply('Instructions have been sent to your DMs.');

        const collector = clicks.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: new Date(contestParam.windowEnd) - datetime,
        });

        collector.on('collect', async r =>{
            row.components[0].setDisabled(true);
            row.components[1].setDisabled(true);
            if(r.customId == 'confirmEligibility'){
                userParam.eligible = true;
            } else {
                userParam.eligible = false;
            }
            r.update({content: contestParam.name + '\n' + contestParam.rules + '\n\nYou have confirmed your eligibility.', components: [row]});
           
            const start_text = 'Once you are ready to start the contest, click the button below.\n'+
            'You will have '+contestParam.duration+' minute(s) to complete the contest.\n'+
            'Use `/submit` to submit your solutions.\n'+
            'Use `/time` to see how much time you have left.';
            
            const clicks2 = await r.user.send({
                content: start_text,
                components: [row2],
            });
            
            const collector2 = clicks2.createMessageComponentCollector({
                componentType: ComponentType.Button,
                time: new Date(contestParam.windowEnd) - datetime,
            });
    
            collector2.on('collect', async r =>{
                row2.components[0].setDisabled(true);
                userParam.timerEnd = Date.now() + contestParam.duration*60000;
                fs.writeFileSync(userFile, JSON.stringify(userParam));
                
                imgFiles = [];
                for(file of contestParam.problems){
                    imgFiles.push(new AttachmentBuilder(path.join(__dirname, '..', 'contestfiles', file)));
                }

                await r.user.send({files: imgFiles});
                r.update({content: start_text + '\n\nYour timer ends at '+new Date(userParam.timerEnd).toString()+'.', components: [row2]});
            });

            collector2.on('end', collected => {});
        });
        collector.on('end', collected => {});
    },
}