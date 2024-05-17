import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { UsersConnectionService } from '@src/users/services/users.connection.service';
import { Server, Socket } from 'socket.io';
import { SocketPayload } from '../constants/socket.payload';

@WebSocketGateway()
export class NotificationGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly userConnectionService: UsersConnectionService) {}

  @WebSocketServer()
  private server: Server;

  afterInit(server: Server) {
    console.log('WebSocket server initialized');
  }

  async handleConnection(client: Socket) {
    const token = client.handshake.auth;
    const decodedUserObject = await this.userConnectionService.decodeJwtToken(
      token.token,
    );
    await this.userConnectionService.connectUser(
      decodedUserObject.sub,
      client.id,
    );
  }

  async handleDisconnect(client: Socket) {
    const token = client.handshake.auth;
    const decodedUserObject = await this.userConnectionService.decodeJwtToken(
      token.token,
    );
    await this.userConnectionService.disconnectUser(
      decodedUserObject.sub,
      client.id,
    );
  }

  async notifyUser(event: string, data: SocketPayload): Promise<void> {
    const receiverSocketId = await this.userConnectionService.getUserSocket(
      data.userId,
    );

    receiverSocketId.forEach((id: string) => {
      this.server.to(id).emit(event, data.message);
    });
  }
}
