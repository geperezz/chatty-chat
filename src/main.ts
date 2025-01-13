import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { DateTime } from "luxon";
import { AppModule } from "./app.module";
import { UserSessionService } from "./chat/user-session.service";
import { CORS } from "./common/constants";
import { RpcExceptionFilter } from "./common/filters/rpc-exception.filter";
import { envs } from "./config";

async function bootstrap() {
  const appName = "Chat Microservice";
  const timezone = DateTime.local().zoneName;
  const appVersion = "0.0.1";

  const logger = new Logger(appName);

  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [
        `amqp://${envs.RABBITMQ_DEFAULT_USER}:${envs.RABBITMQ_DEFAULT_PASS}@${envs.RABBITMQ_HOST}:${envs.RABBITMQ_PORT}`,
      ],
      queue: "chat_queue",
      queueOptions: {
        durable: true,
      },
    },
  });

  const userSessionService = app.get(UserSessionService);

  await userSessionService.deleteAllSessions();

  app.enableCors(CORS);

  app.useGlobalFilters(new RpcExceptionFilter());

  await app.listen(envs.PORT);

  await app.startAllMicroservices();

  logger.log(`🚀  Server is running $`);
  logger.log(`🚀  Microservice is running`);
  logger.log(`🚀  App Name: ${appName}`);
  logger.log(`🚀  Timezone:  ${timezone}`);
  logger.log(`🚀  Version:  ${appVersion}`);
}
bootstrap();
