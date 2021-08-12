import { MomentumUser } from "./momentum-user.class";
import { PersonalSolve } from "./personal-solve.class";

export class PersonalRoom {
    uid: string;
    hostUid: string;
    creation: number;
    private: boolean;
    users: MomentumUser[];
    currentPersonalSolve: PersonalSolve;
}