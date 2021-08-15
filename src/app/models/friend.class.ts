import { FriendStatus } from "./friend-status.enum";

export class Friend {
    uid?: string;
    userUid: string;
    friendUid: string;
    photoURL: string;
    username: string;
    email: string;
    creation: number;
    status: FriendStatus;
}