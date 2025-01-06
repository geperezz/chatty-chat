import { Logger, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { CORS } from "src/common/constants";
import { SocketService } from "src/common/modules/service/socket.service";
import { envs } from "src/config";
import { UserPayload } from "src/types/user-payload.type";
import { ChatService } from "./chat.service";

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
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private logger = new Logger("ChatGateway");
  @WebSocketServer()
  server: Server;

  constructor(
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
    } catch (error) {
      this.handleConnectionError(socket, error);
    }
  }

  public async handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  private authenticateSocket(socket: Socket): UserPayload {
    const token = this.extractJwtToken(socket);
    return this.jwtService.verify<UserPayload>(token, {
      secret: envs.JWT_SECRET,
    });
  }

  private extractJwtToken(socket: Socket): string {
    const authHeader = socket.handshake.headers.authorization;
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
}
