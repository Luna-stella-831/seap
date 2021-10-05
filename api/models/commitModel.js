var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var CommitSchema = new Schema({
  author: {
    type: String
  },
  guraduate_at: {
    type: Number
  },
  commits: [
    {
      date: {
        type: Date,
        default: Date.now
      },
      commit_message: String,
      test_info: [
        {
          name: String,
          status: {
            type: String, //  "pass" or "failed" の2択で行きたい
            enum: ['pass', 'failed']
          }
        }
      ],
      test_summary: [
        {
          name: String,
          status: String
        }
      ]
    }
  ]
});

module.exports = mongoose.model("Commits", CommitSchema);
