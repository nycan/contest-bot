const { SlashCommandBuilder, ButtonBuilder, ActionRowBuilder, ComponentType, AttachmentBuilder } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

module.exports = {
    data: new SlashCommandBuilder().setName('start').setDescription('Write a given contest.')
    .addStringOption(option =>option.setName('name').setDescription('The code given for the contest.').setRequired(true)),
    async execute(interaction, dbclient) {
        await interaction.deferReply();
        const settings = require(path.join(__dirname, '..','settings.json'));
        const contestCode = interaction.options.getString('name');
        let userParam = await dbclient.collection("users").findOne({id: interaction.user.id});
        if(!userParam){
            userParam = {
                currContest: '',
                eligible: false,
                timerEnd: 0,
                answers: [],
                completedContests: [],
            };
        }
        if(userParam.currContest != ''){
            interaction.editReply('You are already in a contest.');
            return;
        }
        const contestParam = await dbclient.collection("contests").findOne({code: contestCode});
        if(!contestParam){
            interaction.editReply('Invalid contest code.');
            return;
        }
        datetime = Date.now();
        if(new Date(contestParam.windowStart) > datetime){
            interaction.editReply('The contest has not started yet. It will start on ' + new Date(contestParam.windowStart).toString() + '.');
            return;
        }
        if(new Date(contestParam.windowEnd) < datetime){
            interaction.editReply('The contest has ended already. :(. It ended on ' + new Date(contestParam.windowEnd).toString() + '.');
            return;
        }
        if(contestParam.whitelist){
            if(!contestParam.list.includes(interaction.user.id)){
                interaction.editReply('You are not eligible for this contest.');
                return;
            }
        } else {
            if(contestParam.list.includes(interaction.user.id)){
                interaction.editReply('You are not eligible for this contest.');
                return;
            }
        }
        if(userParam.completedContests.includes(contestCode)){
            interaction.editReply('You have already completed this contest.');
            return;
        }
        userParam.currContest = contestCode;
        dbclient.collection("users").updateOne({id: interaction.user.id}, {$set: userParam}, {upsert: true});

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
        interaction.editReply('Instructions have been sent to your DMs.');

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
            let start_text;
            if(contestParam.longForm){
                start_text = 'Once you are ready to start the contest, click the button below.\n'+
                'You will have '+contestParam.duration+' minute(s) to complete the contest.\n'+
                'Use `!submit` and attach a file to submit your solution. Note that it is not a slash command. **IMPORTANT:** you can only have one file submission. Any files submitted after that will override the first submission.\n'+
                'Use `/time` to see how much time you have left.\n'+
                'Use `/submissions` to see your current submissions.';
            } else {
                start_text = 'Once you are ready to start the contest, click the button below.\n'+
                'You will have '+contestParam.duration+' minute(s) to complete the contest.\n'+
                'Use `/submit` to submit your solutions.\n'+
                'Use `/time` to see how much time you have left.\n'+
                'Use `/submissions` to see your current submissions.';
            }
            const clicks2 = await r.user.send({
                content: start_text,
                components: [row2],
            });
            
            const collector2 = clicks2.createMessageComponentCollector({
                componentType: ComponentType.Button,
                time: new Date(contestParam.windowEnd) - datetime,
            });

            collector2.on('collect', async r =>{
                r.deferUpdate();
                row2.components[0].setDisabled(true);
                userParam.timerEnd = Math.min(Date.now() + contestParam.duration*60000, new Date(contestParam.windowEnd));
                dbclient.collection("users").updateOne({id: interaction.user.id}, {$set: userParam}, {upsert: true});
                setTimeout(async function(){
                    const userParam2 = await dbclient.collection("users").findOne({id: interaction.user.id});
                    if(!settings.debug){
                        userParam2.completedContests.push(userParam2.currContest);
                    }
                    let score = -1;
                    const graderFile = path.join(__dirname, '..', 'graders', contestCode+'.js');
                    if(contestParam.autoGrade){
                        if(!fs.existsSync(graderFile)){
                            console.error('Grader file not found for contest "'+contestParam.name+'".');
                        } else {
                            const grader = require(graderFile);
                            score = grader.grade(userParam2.answers);
                        }
                    }
                    if(!settings.debug){
                        dbclient.collection("submissions").insertOne({
                            "name": interaction.user.globalName,
                            "official": userParam2.eligible,
                            "time": Date.now(),
                            "score": score,
                            "answers": userParam2.answers,
                            "contest": userParam2.currContest,
                        });
                    }

                    userParam2.currContest = '';
                    userParam2.eligible = false;
                    userParam2.timerEnd = 0;
                    userParam2.answers = [];
                    dbclient.collection("users").updateOne({id: interaction.user.id}, {$set: userParam2}, {upsert: true});
                    let pcRole;
                    if(interaction.guild){
                        pcRole = interaction.guild.roles.cache.find(role => role.name == contestCode+' postcontest');
                    }
                    if(pcRole){
                        const member = await interaction.guild.members.fetch(interaction.user);
                        member.roles.add(pcRole);
                    }
                    const end_text = 'The contest has ended. You can no longer submit solutions.\n'+
                    'Until the contest window is over, please limit discussion about the contest to the postcontest chat.';
                    r.user.send(end_text);
                }, Math.min(contestParam.duration*60000, new Date(contestParam.windowEnd) - Date.now()));
                
                imgFiles = [];
                for(file of contestParam.problems){
                    imgFiles.push(new AttachmentBuilder(path.join(__dirname, '..', 'contestfiles', file)));
                }

                await r.user.send({content: start_text + '\n\nYour timer ends at '+new Date(userParam.timerEnd).toString(), files: imgFiles});
            });

            collector2.on('end', collected => {
                startTimer.setDisabled(true);
                row2.components[0] = startTimer;
                clicks2.edit({content: "Please use `/start` again, as this interaction has ran out.", components: [row2]});
                dbclient.collection("users").updateOne({id: interaction.user.id}, {$set: {currContest: '', eligible: false}}, {upsert: true});
            });
        });
        collector.on('end', collected => {
            confirmEligibility.setDisabled(true);
            cancelEligibility.setDisabled(true);
            row.components[0] = confirmEligibility;
            row.components[1] = cancelEligibility;
            clicks.edit({content: "Please use `/start` again, as this interaction has ran out.", components: [row]});
            dbclient.collection("users").updateOne({id: interaction.user.id}, {$set: {currContest: '', eligible: false}}, {upsert: true});
        });
    },
}