import { Prop, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type ConnectedUserDocument = HydratedDocument<ConnectedUser>;

export class ConnectedUser {
  @Prop({ type: Types.ObjectId })
  id: Types.ObjectId;

  @Prop()
  username: string;

  @Prop()
  socketId: string;
}

export const ConnectedUserSchema = SchemaFactory.createForClass(ConnectedUser);

export interface IConnectedUser {
  readonly id: Types.ObjectId;
  readonly username: string;
  readonly socketId: string;
}
