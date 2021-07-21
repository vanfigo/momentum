import { Record } from "./record.class";

export class Average {
    range: number;
    currentTime: number;
    currentRecords: Record[];
    currentDNF: boolean;
    bestTime: number;
    bestRecords: Record[];
    bestDNF: boolean;
}