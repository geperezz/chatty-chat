import { Member } from "../mongodb/schemas/member.schema";
import { Message } from "../mongodb/schemas/message.schema";
import { RoomType } from "../mongodb/schemas/room.schema";

export interface FormattedResponseRooms {
  readonly _id: string;
  readonly name: string;
  readonly type: RoomType;
  readonly members: Member[];
  readonly lastMessage: Message;
}
