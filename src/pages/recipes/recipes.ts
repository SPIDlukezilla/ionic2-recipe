import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController, PopoverController } from 'ionic-angular';
import { EditRecipePage } from '../edit-recipe/edit-recipe'
import { Recipe } from '../../models/recipe'
import { RecipesService } from '../../services/recipes'
import { RecipePage } from '../recipe/recipe'
import { SLOptionsPage } from '../sl-options/sl-options'
import { AuthService } from '../../services/auth'
import { ShoppingListService } from '../../services/shopping-list'

@IonicPage()
@Component({
  selector: 'page-recipes',
  templateUrl: 'recipes.html',
})
export class RecipesPage {

  recipes: Recipe[];

  constructor(public navCtrl: NavController, public navParams: NavParams,
  private recipesService: RecipesService, private alertCtrl: AlertController, 
  private loadingCtrl: LoadingController, private popoverCtrl: PopoverController,
  private authService: AuthService, private slService: ShoppingListService) {
  }

  ionViewWillEnter(){
    this.recipes = this.recipesService.getRecipes();
  }

  onNewRecipe(){
    this.navCtrl.push(EditRecipePage, {mode: 'New'});
  }

  onLoadRecipe(recipe: Recipe, index: number){
    this.navCtrl.push(RecipePage, {recipe: recipe, index: index});
  }

  onShowOptions(event: MouseEvent){
    const loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    const popover = this.popoverCtrl.create(SLOptionsPage);
    popover.present({ev: event});
    popover.onDidDismiss(
      data => {
        if(!data){
          return;
        }
        if(data.action == 'load'){
          //load
          loading.present();
          this.authService.getActiveUser().getIdToken()
          .then(
            (token: string) => {
              this.recipesService.fetchList(token).subscribe(
                (list: Recipe[]) => {
                  loading.dismiss();
                  if(list){
                    this.recipes = list;
                  }
                  else{
                    this.recipes = [];
                  }
                },
                error => {
                  loading.dismiss();
                  this.handleError(error.json().error);
                }
              );
            }
          );

        }
        else if(data.action == 'save'){
          //store
          loading.present();
          this.authService.getActiveUser().getIdToken()
          .then(
            (token: string) => {
              this.recipesService.storeList(token).subscribe(
                () => {
                  loading.dismiss();
                },
                error => {
                  loading.dismiss();
                  this.handleError(error.json().error);
                }
              );
            }
          );
        }
      }
    );
  }

  private handleError(error: string){
    const alert = this.alertCtrl.create({
      title: 'An error occurred!',
      message: error,
      buttons: ['Ok']
    });
    alert.present();
  }

}
