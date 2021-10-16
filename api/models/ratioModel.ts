var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var RatioSchema = new Schema([
  {
    task: String, year: Number,
    progress: [
      {date:String, status: Number}
    ]
  }
]);

export {RatioSchema as Ratio};