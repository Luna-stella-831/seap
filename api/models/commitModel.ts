import mongoose, { SchemaDefinition, Schema } from "mongoose";

interface CommitSchemaFields {
  author: string;
  graduate_at: string;
  commits: [
    date: string,
    commit_message: String,
    test_info: [
      {
        name: String;
        status: String;
      }
    ],
    test_summary: [
      {
        name: String;
        status: String;
      }
    ]
  ];
}

const CommitSchemaFields: SchemaDefinition<CommitSchemaFields> = {
  author: {
    type: String,
  },
  graduate_at: {
    type: String,
  },
  commits: [
    {
      date: {
        type: Date,
        default: Date.now,
      },
      commit_message: String,
      test_info: [
        {
          name: String,
          status: {
            type: String, //  "pass" or "failed" の2択で行きたい
            enum: ["pass", "failed"],
          },
        },
      ],
      test_summary: [
        {
          name: String,
          status: String,
        },
      ],
    },
  ],
};

const CommitSchema: Schema<CommitSchemaProperties> = new Schema(
  CommitSchemaFields
);

////////////////////////////////////////////////////////////////////////////////
interface PassDateSchemaFields {
  author: string;
  tests: [{ name: string; pass_date: string }];
}

const PassDateSchemaFields: SchemaDefinition<PassDateSchemaFields> = {
  author: String,
  tests: [{ name: String, pass_date: Date }],
};
const PassDateSchema: Schema<PassDateSchemaProperties> = new Schema(
  PassDateSchemaFields
);

////////////////////////////////////////////////////////////////////////////////
interface AggregateSchemaFields {
  test_name: string;
  date: string;
  uids: [];
}

const AggregateSchemaFields: SchemaDefinition<AggregateSchemaFields> = {
  test_name: String,
  date: Date,
  uids: [],
};

const AggregateSchema: Schema<AggregateSchemaProperties> = new Schema(
  AggregateSchemaFields
);

interface CommitSchemaProperties extends CommitSchemaFields {
  foo: () => void;
}

CommitSchema.methods.foo = function () {};

export {
  CommitSchema as Commit,
  PassDateSchema as PassDate,
  AggregateSchema as Aggregate,
};
