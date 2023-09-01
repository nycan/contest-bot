module.exports = {
    async execute(message, dbclient) {
        let userParam = await dbclient.collection("users").findOne({id: message.author.id});
        if(!userParam){
            message.reply('You are not in a contest.');
            return;
        }
        if(userParam.currContest == ''){
            message.reply('You are not in a contest.');
            return;
        }
        if(userParam.timerEnd < Date.now()){
            message.reply('Your time is up. However, you aren\'t supposed to see this message. Please contact an admin as this means that the bot likely crashed during your window.');
            return;
        }
        const contestParam = await dbclient.collection("contests").findOne({code: userParam.currContest});
        if(!contestParam.longForm){
            message.reply('This is not a long-form contest. Please use /submit instead.');
            return;
        }
        const files = message.attachments;
        if(files.size == 0){
            message.reply('Please attach a file.');
            return;
        }
        if(files.size > 1){
            message.reply('Please attach only one file.');
            return;
        }
        message.reply({content: 'Your answer has been changed.', ephemeral: true});
        userParam.answers[0] = files.first().url;
        dbclient.collection("users").updateOne({id: message.author.id}, {$set: userParam}, {upsert: true});
    }
}