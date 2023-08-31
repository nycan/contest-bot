module.exports = {
    async execute(message, dbclient) {
        const files = message.attachments;
        if(files.size == 0){
            message.reply('Please attach a file.');
            return;
        }
        for(const file of files){
            console.log(file[1].url);
        }
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
            interaction.reply('Your time is up. However, you aren\'t supposed to see this message. Please contact an admin as this means that the bot likely crashed during your window.');
            return;
        }

    }
}