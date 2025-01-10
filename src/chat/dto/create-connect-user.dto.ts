import { IsString } from "class-validator";

export class CreateConnectUserDto {
  @IsString()
  username: string;

  @IsString()
  socketId: string;
}
