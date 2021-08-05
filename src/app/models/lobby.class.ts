import { MomentumUser } from './momentum-user.class';
import { RoomType } from './room-type.enum';

export class Lobby {
    user: MomentumUser;
    roomType: RoomType;
    creation: number;
}