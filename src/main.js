const Koa = require("koa");
const Pug = require("koa-pug");
const path = require("path");
const websockify = require("koa-websocket");
const route = require("koa-route");
const serve = require("koa-static");
const mount = require("koa-mount");
const mongoClient = require("./mongo.js");

//const app = new Koa();
const app = websockify(new Koa());

//pug setting
const pug = new Pug({
  viewPath: path.resolve(__dirname, "./views"),
  app: app,
});

app.use(mount("/public", serve("src/public")));

app.use(async (ctx) => {
  await ctx.render("main");
});

const _client = mongoClient.connect();
async function getChatsCollection() {
  const client = await _client; //이 방법을 사용하면 connect를 왜 한번만 실행하지?
  return client.db("chat").collection("chats");
}

// Using routes
app.ws.use(
  route.all("/ws", async (ctx) => {
    const chatsCollection = await getChatsCollection();
    const chatsCursor = chatsCollection.find(
      {},
      {
        sort: {
          createAt: 1,
        },
      }
    );

    const chats = await chatsCursor.toArray();
    //console.log(chats);
    ctx.websocket.send(
      JSON.stringify({
        type: "sync",
        payload: {
          chats,
        },
      })
    );

    // `ctx` is the regular koa context created from the `ws` onConnection `socket.upgradeReq` object.
    // the websocket is added to the context on `ctx.websocket`.
    ctx.websocket.on("message", async (data) => {
      // do something with the message from client
      if (typeof data != "string") {
        return;
      }
      const chat = JSON.parse(data);

      await chatsCollection.insertOne({
        ...chat,
        createAt: new Date(),
      });

      const { message, nickname } = chat;

      const { server } = app.ws;
      if (!server) {
        return;
      }

      server.clients.forEach((client) => {
        client.send(
          JSON.stringify({ type: "chat", payload: { message, nickname } })
        );
      });

      //ctx.websocket.send(JSON.stringify({ message, nickname }));
    });
  })
);

app.listen(5000);
