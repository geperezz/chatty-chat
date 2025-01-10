import { Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { UsersService } from "src/users/users.service";
import { CreateConnectUserDto } from "./dto/create-connect-user.dto";
import { ConnectedUser } from "./schemas/connected-user.schema";

@Injectable()
export class UserSessionService {
  constructor(
    @InjectModel(ConnectedUser.name)
    private readonly userSession: Model<ConnectedUser>,
    @Inject(UsersService)
    private readonly usersService: UsersService,
  ) {}

  async createSession(payload: CreateConnectUserDto) {
    const user = await this.usersService.findOne(payload.username);

    if (!user) {
      throw new Error("User not found");
    }

    const session = await this.userSession.create(payload);
    return session;
  }

  async findSessionByUsername(username: string) {
    const session = await this.userSession.find({ username });
    return session;
  }

  async findSessionBySocketId(socketId: string) {
    const session = await this.userSession.findOne({ socketId });
    return session;
  }

  async deleteSession(socketId: string) {
    const session = await this.userSession.deleteOne({ socketId });
    return session;
  }

  async deleteAllSessions() {
    await this.userSession.deleteMany({});
  }
}
