import { NotificationType } from "./notification-type.enum";

export class Notification {
    uid?: string;
    userToUid: string;
    userFromUid: string;
    photoURL: string;
    username: string;
    email: string;
    message: string;
    notificationType: NotificationType
    read: boolean;
    creation: number;
}