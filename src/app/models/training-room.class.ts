import { MomentumUser } from "./momentum-user.class";
import { RoomStatus } from "./room-status.enum";
import { Session } from "./session.class";

export class TrainingRoom {
    uid: string;
    sessions: Session[];
    activeSessionId: number;
    status: RoomStatus;
    creation: number;

    constructor() {
        let session = new Session();
        this.sessions = [session];
        this.activeSessionId = session.id;
    }
}