import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type UserDocument = HydratedDocument<User>;

@Schema({
  timestamps: true,
})
export class User {
  @Prop({ type: Types.ObjectId })
  id: Types.ObjectId;

  @Prop({ type: String, required: true, unique: true })
  username: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

export interface IUser {
  readonly _id: Types.ObjectId;
  readonly username: string;
}
