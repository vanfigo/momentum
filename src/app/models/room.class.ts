import { Session } from "./session.class";

export class Room {
    sessions: Session[];
    activeSessionId: number;

    constructor() {
        let session = new Session();
        this.sessions = [session];
        this.activeSessionId = session.id;
    }
}