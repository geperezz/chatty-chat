import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

@Schema({ timestamps: { createdAt: true } })
export class Message {
  @Prop({ type: Types.ObjectId })
  id: Types.ObjectId;

  @Prop({ type: String, required: true })
  senderId: string;

  @Prop({ type: String, required: true })
  contents: string;
}

export interface IMessage {
  readonly _id: Types.ObjectId;
  readonly senderId: string;
  readonly contents: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
