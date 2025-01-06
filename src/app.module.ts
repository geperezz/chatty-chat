import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ChatModule } from "./chat/chat.module";
import { envs } from "./config";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    MongooseModule.forRoot(envs.DB_URL, {
      dbName: envs.MONGO_DB,
      auth: {
        username: envs.MONGO_USER,
        password: envs.MONGO_PASSWORD,
      },
    }),
    ChatModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
