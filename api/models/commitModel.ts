import mongoose, { SchemaDefinition, Schema } from "mongoose";

interface CommitSchemaFields {
  author: string;
  graduate_at: string;
  commits: [
    date:string,
    commit_message:String,
    test_info:[
      {
        name: String,
        status: String
      }
    ],
    test_summary: [
      {
        name: String,
        status: String
      }
    ]
  ]
}

const CommitSchemaFields: SchemaDefinition<CommitSchemaFields> ={
  author: {
    type: String
  },
  graduate_at: {
    type: String
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
};

const CommitSchema: Schema<CommitSchemaProperties> = new Schema(CommitSchemaFields);

interface CommitSchemaProperties extends CommitSchemaFields {
  foo: () => void;
}
CommitSchema.methods.foo = function() {};

export {CommitSchema as Commit};
