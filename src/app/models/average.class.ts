import { Record } from "./record.class";

export class Average {
    range: number;
    currentTime: number;
    currentRecords: Record[];
    currentDNF: boolean;
    bestTime: number;
    bestRecords: Record[];
    bestDNF: boolean;

    constructor(range: number) {
        this.range = range;
        this.currentTime = null;
        this.currentRecords = [];
        this.currentDNF = false;
        this.bestTime = null;
        this.bestRecords = [];
        this.bestDNF = false;
    }
}