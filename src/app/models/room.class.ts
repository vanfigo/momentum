import { MomentumUser } from "./momentum-user.class";
import { RoomStatus } from "./room-status.enum";
import { RoomType } from "./room-type.enum";
import { Session } from "./session.class";

export class Room {
    uid: string;
    sessions: Session[];
    activeSessionId: number;
    scrambles: string[];
    users: MomentumUser[];
    status: RoomStatus;
    roomType: RoomType;
    creation: number;

    constructor() {
        let session = new Session();
        this.sessions = [session];
        this.activeSessionId = session.id;
        this.scrambles = [];
        this.users = []
        this.status = RoomStatus.STARTED
    }
}