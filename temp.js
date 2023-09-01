const { Client, Collection, Events, GatewayIntentBits, Partials } = require('discord.js');
const { MongoClient } = require('mongodb');
require('dotenv').config()
token = process.env.DISCORD_TOKEN;
connection_string = process.env.MONGO_CONNECTION_STRING;
const client = new Client({ intents: [GatewayIntentBits.Guilds,GatewayIntentBits.DirectMessages, GatewayIntentBits.GuildMembers], partials: [Partials.Channel] });
const db = new MongoClient(connection_string);

client.on("ready", async() => {
    console.log("starting");
    const guild = await client.guilds.fetch("1079959947745439824");
    await guild.members.fetch();
    console.log("members fetched");
    const db = new MongoClient(connection_string);
    db.on('commandStarted',started=>console.log(started));
    const dbclient = db.db("contest-bot");
    console.log("database connected");
    let userfiles = await dbclient.collection("users").find({}).toArray();
    console.log("userfiles: "+userfiles.length)
    for(var i = 0; i<userfiles.length; ++i){
        let res = guild.members.cache.find(m => m.user.id===userfiles[i].id);
        if(res){
            await dbclient.collection("users").updateOne({id:res.user.id},{$set:{name:res.user.tag}});
            console.log("updated "+res.user.id+" to "+res.user.tag);
        }
    }
    console.log("done");
});

client.login(token);