// import Koa from "koa";
// import Pug from "koa-pug";
// import path from "path";

const Koa = require("koa");
const Pug = require("koa-pug");
const path = require("path");

const app = new Koa();
const pug = new Pug({
  viewPath: path.resolve(__dirname, "./views"),
  app: app,
});

app.use(async (ctx) => {
  await ctx.render("main");
});

app.listen(5000);
