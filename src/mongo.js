const { MongoClient } = require("mongodb");
require("dotenv").config();

const uri = `mongodb+srv://takaxis2:${process.env.MONGO_PASSWORD}@cluster0.jrpdq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

module.exports = client;
