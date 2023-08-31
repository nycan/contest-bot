module.exports = {
    async execute(message, dbclient) {
        const files = message.attachments;
        if(files.size == 0){
            await message.reply('Please attach a file.');
            return;
        }
        for(const file of files){
            console.log(file[1].url);
        }
        let userParam = await dbclient.collection("users").findOne({id: message.author.id});
        if(!userParam){
            await message.reply('You are not in a contest.');
            return;
        }
        if(userParam.currContest == ''){
            await message.reply('You are not in a contest.');
            return;
        }
        if(userParam.timerEnd < Date.now()){
            await interaction.reply('Your time is up. However, you aren\'t supposed to see this message. Please contact an admin as this means that the bot likely crashed during your window.');
            return;
        }

    }
}