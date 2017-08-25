import { Ingredient } from "./ingredient"
export class Recipe {
    constructor(public title: string,
         public description: string, 
         public dificulty: string,
         public ingredients: Ingredient[]){

    }
}