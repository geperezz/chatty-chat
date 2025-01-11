import { forwardRef, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { MongooseModule } from "@nestjs/mongoose";
import { ExternalModule } from "src/common/modules/service/external.module";
import { envs } from "src/config";
import { UsersModule } from "src/users/users.module";
import { ChatController } from "./chat.controller";
import { ChatGateway } from "./chat.gateway";
import { ChatService } from "./chat.service";
import {
  ConnectedUser,
  ConnectedUserSchema,
} from "./mongodb/schemas/connected-user.schema";
import { Room, RoomSchema } from "./mongodb/schemas/room.schema";
import { UserSessionService } from "./user-session.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ConnectedUser.name, schema: ConnectedUserSchema },
      { name: Room.name, schema: RoomSchema },
    ]),
    ExternalModule,
    JwtModule.register({
      secret: envs.JWT_SECRET,
      signOptions: { expiresIn: "1d" },
    }),
    forwardRef(() => UsersModule),
  ],
  controllers: [ChatController],
  providers: [ChatGateway, ChatService, UserSessionService],
  exports: [ChatService],
})
export class ChatModule {}
