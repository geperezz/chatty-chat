import { forwardRef, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { MongooseModule } from "@nestjs/mongoose";
import { ExternalModule } from "src/common/modules/service/external.module";
import { envs } from "src/config";
import { UsersModule } from "src/users/users.module";
import { ChatGateway } from "./chat.gateway";
import { ChatService } from "./chat.service";
import {
  ConnectedUser,
  ConnectedUserSchema,
} from "./schemas/connected-user.schema";
import { UserSessionService } from "./user-session.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ConnectedUser.name, schema: ConnectedUserSchema },
    ]),
    ExternalModule,
    JwtModule.register({
      secret: envs.JWT_SECRET,
      signOptions: { expiresIn: "1d" },
    }),
    forwardRef(() => UsersModule),
  ],
  providers: [ChatGateway, ChatService, UserSessionService],
  exports: [ChatService],
})
export class ChatModule {}
