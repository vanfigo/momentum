import { Average } from "./average.class";
import { CategoryType } from "./category-type.enum";
import { Record } from "./record.class";

export class Category {
    id: number;
    categoryType: CategoryType;
    records: Record[];
    averages: Average[];

    constructor() {
        this.categoryType = CategoryType.CUBE3X3;
        this.records = [];
        this.averages = [];
    }
}