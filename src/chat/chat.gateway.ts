import {
  Logger,
  UnauthorizedException,
  UseFilters,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from "@nestjs/websockets";
import { Observable } from "rxjs";
import { Server, Socket } from "socket.io";
import { CORS } from "src/common/constants";
import { WebsocketExceptionsFilter } from "src/common/filters/socket-exception.filter";
import { SocketService } from "src/common/modules/service/socket.service";
import { envs } from "src/config";
import { UserPayload } from "src/types/user-payload.type";
import { ChatService } from "./chat.service";
import { MessageDto } from "./dto/message.dto";
import { UserSessionService } from "./user-session.service";

@WebSocketGateway({
  path: "/ws",
  cors: CORS,
  pingTimeout: 60000,
  pingInterval: 25000,
  connectTimeout: 30000,
  allowEIO3: true,
  transports: ["websocket"],
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000,
    skipMiddlewares: true,
  },
})
@UseFilters(WebsocketExceptionsFilter)
@UsePipes(new ValidationPipe({ transform: true }))
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private logger = new Logger("ChatGateway");
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly userSessionService: UserSessionService,
    private readonly chatService: ChatService,
    private readonly socketService: SocketService,
    private readonly jwtService: JwtService,
  ) {}

  afterInit(server: Server) {
    this.socketService.socket = server;
    this.logger.log("Websocket gateway initialized");
  }

  public async handleConnection(socket: Socket) {
    this.logger.log(`Client connected: ${socket.id}`);
    try {
      const user = this.authenticateSocket(socket);

      await this.userSessionService.createSession({
        username: user.username,
        socketId: socket.id,
      });

      await this.chatService.joinMyChatsRoom(user.username, socket);
    } catch (error) {
      this.handleConnectionError(socket, error);
    }
  }

  public async handleDisconnect(client: Socket) {
    try {
      this.logger.log(`Client disconnected: ${client.id}`);

      const session = await this.userSessionService.findSessionBySocketId(
        client.id,
      );

      if (session) {
        await this.disconnectClientOfTheRooms(client);
        await this.userSessionService.deleteSession(client.id);
      }
    } catch (error) {
      this.logger.error(`Error disconnecting client: ${error.message}`);
    }
  }

  @SubscribeMessage("send-message")
  async onMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: MessageDto,
  ) {
    try {
      const event: string = "message";

      await this.chatService.storeMessage(data);

      client.to(data.roomId).emit(event, data);

      this.logger.log(`Message sent to room ${data.roomId}`);

      return new Observable((observer) => {
        observer.next({ event, data });
        observer.complete();
      });
    } catch (error) {
      this.logger.error(`Error sending message: ${error.message}`);
      throw new WsException(error.message);
    }
  }

  @SubscribeMessage("join-room")
  async onJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    console.log("Join room", data.roomId);
    try {
      const user = await this.userSessionService.findSessionBySocketId(
        client.id,
      );

      if (!user) {
        throw new UnauthorizedException("User not found");
      }

      await this.chatService.joinChatRoom(data.roomId, user.username);

      this.logger.log(`Client ${client.id} joined room ${data.roomId}`);

      client.to(data.roomId).emit("user-joined", {
        roomId: data.roomId,
        message: `${user.username} joined the room`,
      });

      return new Observable((observer) => {
        observer.next({ event: "join-room", data: data.roomId });
        observer.complete();
      });
    } catch (error) {
      this.logger.error(`Error joining room: ${error.message}`);
      throw new WsException(error.message);
    }
  }

  private authenticateSocket(socket: Socket): UserPayload {
    const token = this.extractJwtToken(socket);

    return this.jwtService.verify<UserPayload>(token, {
      secret: envs.JWT_SECRET,
    });
  }

  private extractJwtToken(socket: Socket): string {
    const authHeader = socket.handshake.auth.token;

    console.log("Auth header", authHeader);

    if (!authHeader)
      throw new UnauthorizedException("No authorization header found");

    const [bearer, token] = authHeader.split(" ");
    if (bearer !== "Bearer" || !token)
      throw new UnauthorizedException("Invalid or missing token");

    return token;
  }

  private handleConnectionError(socket: Socket, error: Error): void {
    this.logger.error(
      `Connection error for socket ${socket.id}: ${error.message}`,
    );
    socket.emit("exception", "Authentication error");
    socket.disconnect();
  }

  private async disconnectClientOfTheRooms(client: Socket): Promise<void> {
    const user = await this.userSessionService.findSessionBySocketId(client.id);

    if (!user) {
      return;
    }

    const rooms = await this.chatService.findRoomsByUsername(user.username);

    if (rooms.length === 0) {
      return;
    }

    await Promise.all(
      rooms.map(async (room) => {
        client.leave(room._id.toString());
      }),
    );
  }
}
