export class Record {
    id: number;
    time: number;
    creation: number;
    scramble: string;
    plus: boolean;
    dnf: boolean;
    partOfAverage?: boolean;

    constructor(id: number) {
        this.id = id;
        this.time = 0;
        this.creation = new Date().getTime();
        this.plus = false;
        this.dnf = false;
        this.partOfAverage = true;
    }
}