import { Body, Controller } from "@nestjs/common";
import { MessagePattern, RpcException } from "@nestjs/microservices";
import { ChatService } from "./chat.service";
import { CreateRoomDto } from "./dto/create-room.dto";

@Controller("chat")
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @MessagePattern("create_room")
  async createRoom(@Body() createRoomDto: CreateRoomDto) {
    try {
      return await this.chatService.createRoom(createRoomDto);
    } catch (error) {
      throw new RpcException(error);
    }
  }
}
