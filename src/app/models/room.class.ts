import { Session } from "./session.class";

export class Room {
    sessions: Session[];
    activeSessionId: number;
    scrambles: string[];

    constructor() {
        let session = new Session();
        this.sessions = [session];
        this.activeSessionId = session.id;
        this.scrambles = [];
    }
}