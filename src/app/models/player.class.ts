import { MomentumUser } from "./momentum-user.class";
import { Record } from "./record.class";

export class Player {
    uid: string;
    username: string;
    email: string;
    photoURL: string;
    active?: boolean = true;
    solves?: Record[];
}