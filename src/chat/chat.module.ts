import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ExternalModule } from "src/common/modules/service/external.module";
import { envs } from "src/config";
import { ChatGateway } from "./chat.gateway";
import { ChatService } from "./chat.service";

@Module({
  imports: [
    ExternalModule,
    JwtModule.register({
      secret: envs.JWT_SECRET,
      signOptions: { expiresIn: "1d" },
    }),
  ],
  providers: [ChatGateway, ChatService],
  exports: [ChatService],
})
export class ChatModule {}
