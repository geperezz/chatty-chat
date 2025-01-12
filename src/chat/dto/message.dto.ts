import { IsNotEmpty, IsString } from "class-validator";

export class MessageDto {
  @IsString()
  @IsNotEmpty()
  roomId: string;

  @IsString()
  @IsNotEmpty()
  senderId: string;

  @IsString()
  @IsNotEmpty()
  contents: string;
}
