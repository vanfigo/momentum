import { Average } from "./average.class";
import { Category } from "./category.class";
import { Record } from "./record.class";

export class Session {
    id: number;
    name: string;
    categories: Category[];
    activeCategoryId: number;

    constructor() {
        this.id = 0;
        this.name = "main";
        let category = new Category();
        this.categories = [category];
        this.activeCategoryId = category.id;
    }
}