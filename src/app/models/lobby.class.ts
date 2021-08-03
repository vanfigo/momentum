import { Player } from './player.class';
import { RoomType } from './room-type.enum';

export class Lobby {
    user: Player;
    roomType: RoomType;
    creation: number;
}