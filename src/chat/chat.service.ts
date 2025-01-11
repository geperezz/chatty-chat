import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { UsersService } from "src/users/users.service";
import { CreateRoomDto } from "./dto/create-room.dto";
import { Room, RoomType } from "./mongodb/schemas/room.schema";

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Room.name)
    private readonly roomCollection: Model<Room>,
    @Inject(UsersService)
    private readonly usersService: UsersService,
  ) {}

  async createRoom(payload: CreateRoomDto): Promise<Room> {
    const findUsers = await this.usersService.findAll(payload.members);

    if (findUsers.length === 0) {
      throw new RpcException(new BadRequestException("Users not found"));
    }

    const userIds = findUsers.map((user) => user._id);

    const findChat = await this.roomCollection.findOne({
      type: RoomType.SINGLE,
      $and: userIds.map((id) => ({
        members: { $elemMatch: { userId: id } },
      })),
    });

    if (findChat) {
      throw new RpcException(new BadRequestException("Room already exists"));
    }

    const users = findUsers.map((user) => ({
      userId: user._id,
      username: user.username,
    }));

    const room = await this.roomCollection.create({
      ...payload,
      members: users,
    });

    return room;
  }

  async findRoomById(roomId: string): Promise<Room> {
    const room = await this.roomCollection.findById(roomId);

    return room;
  }

  async findRoomsByUserId(userId: string): Promise<Room[]> {
    const rooms = await this.roomCollection.find({
      "members._id": userId,
    });

    return rooms;
  }
}
