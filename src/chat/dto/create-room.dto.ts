import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsString,
  ValidateIf,
} from "class-validator";
import { MemberRequest } from "../mongodb/schemas/member.schema";
import { RoomType } from "../mongodb/schemas/room.schema";

export class CreateRoomDto {
  @IsString()
  @ValidateIf((o) => o.type != RoomType.SINGLE)
  name?: string;

  @IsEnum(RoomType)
  @ValidateIf((o) => o.type)
  type: RoomType;

  @IsArray({ each: true })
  @ArrayNotEmpty()
  members: MemberRequest[];
}
