import { Record } from "./record.class";
import { RoomType } from "./room-type.enum";

export class Registry {
    uid: string;
    userUid: string;
    roomType: RoomType;
    roomUid: string;
    won: boolean;
    average: number;
    opponentAverage: number;
    opponentUsername: string;
    opponentPhotoUrl: string;
    records: Record[];
    opponentRecords: Record[];
    creation: number;
}