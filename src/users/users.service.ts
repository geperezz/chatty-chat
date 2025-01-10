import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateUserDto } from "./dto/create-user.dto";
import { User } from "./schemas/user.schema";

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
      throw new Error("User already exists");
    }

    const user = await this.userModel.create(payload);
    return user;
  }

  findOne(username: string) {
    const user = this.userModel.findOne({ username });
    return user;
  }
}
