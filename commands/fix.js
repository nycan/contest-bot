const { SlashCommandBuilder } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

module.exports = {
    data: new SlashCommandBuilder().setName('fix').setDescription('Fix up stuff if the bot crashed.'),
    async execute(interaction, dbclient) {
        await interaction.deferReply();
        const settings = require(path.join(__dirname, '..','settings.json'));
        const member = await interaction.guild.members.fetch(interaction.user);
        if(!member._roles.includes(settings.adminRole)){
            interaction.editReply('You are not allowed to use this command.');
            return;
        }
        const users_fixed = [];
        const user_contests = [];
        const query = {$and: [
            {currContest: {$ne: ''}},
            {timerEnd: {$lt: Date.now()}},
            {timerEnd: {$ne: 0}}]};
        const users = await dbclient.collection("users").find(query);
        for(const userParam of users){
            const contestCode = userParam.currContest;
            const contestParam = await dbclient.collection("contests").findOne({code: contestCode});
            if(!contestParam){
                continue;
            }
            userParam.completedContests.push(userParam.currContest);
            let score = -1;
            const graderFile = path.join(__dirname, '..', 'graders', contestCode+'.js');
            if(contestParam.autoGrade){
                if(!fs.existsSync(graderFile)){
                    console.error('Grader file not found for contest "'+contestParam.name+'".');
                } else {
                    const grader = require(graderFile);
                    score = grader.grade(userParam.answers);
                }
            }
            dbclient.collection("submissions").insertOne({
                "name": interaction.user.globalName,
                "official": userParam.eligible,
                "time": userParam.timerEnd,
                "score": score,
                "answers": userParam.answers,
            });
            userParam.currContest = '';
            userParam.eligible = false;
            userParam.timerEnd = 0;
            userParam.answers = [];
            dbclient.collection("users").updateOne({id: userParam.id}, {$set: userParam});
            let pcRole;
            if(interaction.guild){
                pcRole = interaction.guild.roles.cache.find(role => role.name == contestCode+' postcontest');
            }
            const user = await interaction.guild.members.fetch(userFile.slice(0,-5));
            if(pcRole){
                user.roles.add(pcRole);
            }
            users_fixed.push(user.displayName);
            user_contests.push(contestParam.name);
            fields = [];
            for(var i = 0; i < users_fixed.length; i++){
                fields.push({
                    name: users_fixed[i],
                    value: user_contests[i],
                });
            }
            const embed = {
                color: 0xd10a0a,
                title: 'Fixed Users',
                fields: fields,
            };
            interaction.editReply({embeds: [embed]});
        }
    },
}