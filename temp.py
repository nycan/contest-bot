import pymongo
import json
from pymongo import MongoClient, InsertOne

client = pymongo.MongoClient("mongodb+srv://canadamathserv:AG8nayh8ftuyuJSq@contest-bot.s8mawxt.mongodb.net/?retryWrites=true&w=majority")
db = client["contest-bot"]
collection = db.submissions
requesting = []

with open(r"/Users/nialan/Downloads/cmdc1 (6).json") as f:
    for jsonObj in f:
        myDict = json.loads(jsonObj)["submissions"]
        for sub in myDict:
            sub["contest"] = "cmdc1"
            requesting.append(InsertOne(sub))

result = collection.bulk_write(requesting)
client.close()