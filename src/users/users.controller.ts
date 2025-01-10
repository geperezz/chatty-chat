import { Body, Controller, Get, Param } from "@nestjs/common";
import { MessagePattern } from "@nestjs/microservices";
import { CreateUserDto } from "./dto/create-user.dto";
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern("create_user")
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get(":username")
  findOne(@Param("username") username: string) {
    return this.usersService.findOne(username);
  }
}
