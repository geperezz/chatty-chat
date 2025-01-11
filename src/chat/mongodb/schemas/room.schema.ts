import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

import { IMember, Member, MemberSchema } from "./member.schema";
import { IMessage, Message, MessageSchema } from "./message.schema";

export type RoomDocument = HydratedDocument<Room>;

export enum RoomType {
  SINGLE = "SINGLE",
  GROUP = "GROUP",
}

@Schema({ timestamps: { createdAt: true, updatedAt: true } })
export class Room {
  @Prop({ type: Types.ObjectId })
  id: Types.ObjectId;

  @Prop({ type: String, required: false })
  name: string;

  @Prop({ enum: RoomType, required: true })
  type: RoomType;

  @Prop({ type: [MemberSchema], required: false })
  members: Member[];

  @Prop({ type: [MessageSchema], required: false })
  messages: Message[];
}

export interface IRoom {
  readonly _id: Types.ObjectId;
  readonly name: string;
  readonly type: RoomType;
  readonly members: IMember[];
  readonly messages: IMessage[];
}

export const RoomSchema = SchemaFactory.createForClass(Room);
