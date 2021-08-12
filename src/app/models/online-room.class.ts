import { MomentumUser } from "./momentum-user.class";
import { RoomStatus } from "./room-status.enum";
import { RoomType } from "./room-type.enum";
import { Session } from "./session.class";

export class OnlineRoom {
    uid: string;
    sessions: Session[];
    activeSessionId: number;
    scrambles: string[];
    users: MomentumUser[];
    status: RoomStatus;
    roomType: RoomType;
    creation: number;
}