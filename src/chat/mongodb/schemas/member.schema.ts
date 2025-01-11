import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IsNotEmpty, IsString } from "class-validator";
import { Types } from "mongoose";

@Schema()
export class Member {
  @Prop({ type: Types.ObjectId })
  id: Types.ObjectId;

  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String, required: true })
  username: string;
}

export class MemberRequest {
  @IsString()
  @IsNotEmpty()
  username: string;
}

export interface IMember {
  readonly _id: Types.ObjectId;
  readonly userId: string;
  readonly username: string;
}

export const MemberSchema = SchemaFactory.createForClass(Member);
