import { Record } from "./record.class";
import { RoomType } from "./room-type.enum";

export class Registry {
    uid: string;
    userUid: string;
    userUsername: string;
    userPhotoURL: string;
    roomType: RoomType;
    roomUid: string;
    won: boolean;
    average: number;
    opponentAverage: number;
    opponentUid: string;
    opponentUsername: string;
    opponentPhotoURL: string;
    records: Record[];
    opponentRecords: Record[];
    creation: number;
}