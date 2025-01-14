import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Socket } from "socket.io";
import { SocketService } from "src/common/modules/service/socket.service";
import { UsersService } from "src/users/users.service";
import { CreateRoomDto } from "./dto/create-room.dto";
import { MessageDto } from "./dto/message.dto";
import { FormattedResponseRooms } from "./interfaces/formattedResponseRooms.interface";
import { Message } from "./mongodb/schemas/message.schema";
import { Room, RoomType } from "./mongodb/schemas/room.schema";
import { UserSessionService } from "./user-session.service";

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Room.name)
    private readonly roomCollection: Model<Room>,
    @Inject(UsersService)
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => SocketService))
    private readonly socketService: SocketService,
    @Inject(forwardRef(() => UserSessionService))
    private readonly userSessionService: UserSessionService,
  ) {}

  async createRoom(payload: CreateRoomDto): Promise<Room> {
    const findUsers = await this.usersService.findAll(payload.members);

    if (findUsers.length === 0) {
      throw new RpcException(new BadRequestException("Users not found"));
    }

    if (findUsers.length > 2 && payload.type === RoomType.SINGLE) {
      throw new RpcException(
        new BadRequestException("Cannot create a room with more than 2 users"),
      );
    }

    const userIds = findUsers.map((user) => user._id);

    const findChat = await this.roomCollection
      .findOne({
        type: RoomType.SINGLE,
        $and: userIds.map((id) => ({
          members: { $elemMatch: { userId: id } },
        })),
      })
      .exec();

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

  async joinMyChatsRoom(username: string, client: Socket): Promise<void> {
    const user = await this.usersService.findOne(username);

    if (!user) {
      throw new RpcException(new BadRequestException("User not found"));
    }

    const room = await this.roomCollection.find({
      members: { $elemMatch: { userId: user._id } },
    });

    if (room.length === 0) {
      return;
    }

    await Promise.all(
      room.map(async (chat) => {
        console.log("Joining room", chat._id.toString());
        await client.join(chat._id.toString());
      }),
    );
  }

  async joinChatRoom(roomId: string, username: string): Promise<void> {
    const room = await this.roomCollection
      .findById({
        _id: roomId,
      })
      .exec();

    if (!room) {
      throw new RpcException(new BadRequestException("Room not found"));
    }

    const user = await this.usersService.findOne(username);

    console.log("User", user);

    const isMember = room.members.some(
      (member) => member.userId === user._id.toString(),
    );

    console.log("Is member", isMember);

    if (isMember) {
      throw new RpcException(
        new BadRequestException("User is already part of the room"),
      );
    }

    if (room.type === RoomType.SINGLE) {
      throw new RpcException(
        new BadRequestException("Cannot join a single chat room"),
      );
    }

    const userSession = await this.userSessionService.findSessionByUsername(
      user.username,
    );

    if (userSession.length > 0) {
      await Promise.all(
        userSession.map(async (session) => {
          this.socketService.socket.in(session.socketId).socketsJoin(roomId);
          this.socketService.socket
            .in(session.socketId)
            .emit("user-joined-success", {
              message: "You have joined successfully",
              roomId,
            });
        }),
      );
    }

    await this.roomCollection.findOneAndUpdate(
      { _id: roomId },
      { $push: { members: { userId: user._id, username: user.username } } },
    );
  }

  async storeMessage(payload: MessageDto) {
    if (!payload.roomId) {
      throw new RpcException(new BadRequestException("Room ID is required"));
    }

    const room = await this.roomCollection
      .findById({
        _id: payload.roomId,
      })
      .exec();

    if (!room) {
      throw new RpcException(new BadRequestException("Room not found"));
    }

    const isMember = room.members.some(
      (member) => member.userId === payload.senderId,
    );
    if (!isMember) {
      throw new RpcException(
        new BadRequestException("User not part of the room"),
      );
    }

    const newMessage = new Message();
    newMessage.senderId = payload.senderId;
    newMessage.contents = payload.contents;

    const updatedRoom = await this.roomCollection
      .findOneAndUpdate(
        { _id: payload.roomId },
        { $push: { messages: newMessage } },
        { new: true },
      )
      .exec();

    return {
      roomId: updatedRoom._id,
      senderId: payload.senderId,
      contents: payload.contents,
      _id: updatedRoom.messages[updatedRoom.messages.length - 1].id,
    };
  }

  async findRoomById(payload: {
    roomId: string;
    username: string;
  }): Promise<Room> {
    const room = await this.roomCollection
      .findOne({
        _id: payload.roomId,
        "members.username": payload.username,
      })
      .exec();

    return room;
  }

  async findRoomsByUsername(
    username: string,
  ): Promise<FormattedResponseRooms[]> {
    const user = await this.usersService.findOne(username);

    const rooms = await this.roomCollection
      .find({
        "members.userId": user._id,
      })
      .select({
        _id: 1,
        name: 1,
        type: 1,
        members: 1,
        messages: { $slice: -1 }, // Solo devolver el último mensaje
      })
      .exec();

    const formattedRooms = rooms.map((room) => ({
      _id: room._id.toString(),
      name: room.name,
      type: room.type,
      members: room.members,
      lastMessage: room.messages[0],
    }));

    return formattedRooms;
  }

  async findGroupRooms(): Promise<Room[]> {
    const rooms = await this.roomCollection
      .find({
        type: RoomType.GROUP,
      })
      .exec();

    return rooms;
  }
}
