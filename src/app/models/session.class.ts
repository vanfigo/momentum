import { Category } from "./category.class";

export class Session {
    id: number;
    name: string;
    categories: Category[];
    activeCategoryType: string;

    constructor(id: number = 0, name: string = 'main') {
        this.id = id;
        this.name = name;
        let category = new Category();
        this.categories = [category];
        this.activeCategoryType = category.categoryType;
    }
}