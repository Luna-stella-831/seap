import mongoose from "mongoose";
import express from "express";
const app = express();
const port = process.env.PORT || 3000;
import bodyParser from "body-parser";
import * as controler from "./api/controllers/commitController";

const allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
    res.header(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, access_token'
    )
  
    // intercept OPTIONS method
    if ('OPTIONS' === req.method) {
      res.send(200)
    } else {
      next()
    }
  }
  app.use(allowCrossDomain)

mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost/seapdb");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

import { routes } from "./api/routes/commitRoutes"; // Routeのインポート
routes(app); //appにRouteを設定する。

app.listen(port); // appを特定のportでlistenさせる。

console.log("commit list RESTful API server started on: " + port);
controler.initAll();
