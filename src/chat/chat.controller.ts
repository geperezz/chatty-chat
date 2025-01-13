import { Body, Controller, Logger } from "@nestjs/common";
import { MessagePattern, RpcException } from "@nestjs/microservices";
import { ChatService } from "./chat.service";
import { CreateRoomDto } from "./dto/create-room.dto";

@Controller("chat")
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  private logger = new Logger("ChatController");

  @MessagePattern("create_room")
  async createRoom(@Body() createRoomDto: CreateRoomDto) {
    try {
      return await this.chatService.createRoom(createRoomDto);
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @MessagePattern("my_rooms")
  async getMyRooms(@Body() username: string) {
    try {
      this.logger.log(`Getting rooms for ${username}`);
      return await this.chatService.findRoomsByUsername(username);
    } catch (error) {
      this.logger.error(error);
      throw new RpcException(error);
    }
  }

  @MessagePattern("room_by_id")
  async getRoomById(@Body() payload: { roomId: string; username: string }) {
    try {
      this.logger.log(
        `Getting room with id ${payload.roomId} for ${payload.username}`,
      );
      return await this.chatService.findRoomById(payload);
    } catch (error) {
      this.logger.error(error);
      throw new RpcException(error);
    }
  }

  @MessagePattern("rooms_group")
  async getGroupRooms() {
    try {
      this.logger.log("Getting group rooms");
      return await this.chatService.findGroupRooms();
    } catch (error) {
      this.logger.error(error);
      throw new RpcException(error);
    }
  }
}
