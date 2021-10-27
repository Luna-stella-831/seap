import mongoose from "mongoose";
import express from "express";
const app = express();
const port = process.env.PORT || 3000;
import bodyParser from "body-parser";
import * as controler from "./api/controllers/commitController";

mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost/seapdb");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

import { routes } from "./api/routes/commitRoutes"; // Routeのインポート
routes(app); //appにRouteを設定する。

app.listen(port); // appを特定のportでlistenさせる。

app.route("/api/all").get(controler.all);
console.log("commit list RESTful API server started on: " + port);
