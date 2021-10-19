import mongoose, { SchemaDefinition, Schema } from "mongoose";

interface RatioSchemaFields {
  task: String;
  year: Number;
  progress: [{ date: String; status: Number }];
}

const RatioSchemaFields: SchemaDefinition<RatioSchemaFields> = {
  task: String,
  year: Number,
  progress: [{ date: String, status: Number }],
};

const RatioSchema: Schema<RatioSchemaProperties> = new Schema(
  RatioSchemaFields
);

interface RatioSchemaProperties extends RatioSchemaFields {
  foo: () => void;
}
RatioSchema.methods.foo = function () {};

export { RatioSchema as Ratio };
