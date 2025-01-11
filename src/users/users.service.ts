import { BadRequestException, Injectable } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { MemberRequest } from "src/chat/mongodb/schemas/member.schema";
import { CreateUserDto } from "./dto/create-user.dto";
import { IUser, User } from "./schemas/user.schema";

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}
  async create(payload: CreateUserDto) {
    const userExist = await this.userModel.findOne({
      username: payload.username,
    });

    if (userExist) {
      throw new RpcException(new BadRequestException("User already exists"));
    }

    const user = await this.userModel.create(payload);
    return user;
  }

  async findOne(username: string) {
    const user = await this.userModel.findOne({ username });
    return user;
  }

  async findAll(members: MemberRequest[]): Promise<IUser[]> {
    const usernames = members.map((member) => member.username);

    const users = await this.userModel.find({
      username: { $in: usernames },
    });

    if (users.length !== usernames.length) {
      throw new RpcException(
        new BadRequestException("One or more users not found"),
      );
    }

    return users;
  }
}
