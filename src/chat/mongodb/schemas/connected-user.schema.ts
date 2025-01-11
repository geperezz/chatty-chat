import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type ConnectedUserDocument = HydratedDocument<ConnectedUser>;
@Schema({
  timestamps: true,
})
export class ConnectedUser {
  @Prop({ type: Types.ObjectId })
  id: Types.ObjectId;

  @Prop({ type: String, required: true })
  username: string;

  @Prop({ type: String, required: true })
  socketId: string;
}

export const ConnectedUserSchema = SchemaFactory.createForClass(ConnectedUser);

export interface IConnectedUser {
  readonly id: Types.ObjectId;
  readonly username: string;
  readonly socketId: string;
}
