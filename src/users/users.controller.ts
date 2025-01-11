import { Body, Controller, Get, Param } from "@nestjs/common";
import { MessagePattern, RpcException } from "@nestjs/microservices";
import { CreateUserDto } from "./dto/create-user.dto";
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern("create_user")
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      return await this.usersService.create(createUserDto);
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get(":username")
  findOne(@Param("username") username: string) {
    return this.usersService.findOne(username);
  }
}
