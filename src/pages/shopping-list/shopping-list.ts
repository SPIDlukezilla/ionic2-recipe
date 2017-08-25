import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, PopoverController, LoadingController, AlertController } from 'ionic-angular';
import { NgForm } from '@angular/forms'
import { ShoppingListService } from '../../services/shopping-list'
import { Ingredient } from '../../models/ingredient'
import { SLOptionsPage } from '../../pages/sl-options/sl-options'
import { AuthService } from '../../services/auth'


@IonicPage()
@Component({
  selector: 'page-shopping-list',
  templateUrl: 'shopping-list.html',
})
export class ShoppingListPage {

  listItems: Ingredient[];

  constructor(public navCtrl: NavController, public navParams: NavParams, 
    private slService: ShoppingListService, private popoverCtrl: PopoverController,
  private authService: AuthService ,private loadingCtrl: LoadingController, private alertCtrl: AlertController) {
  }

  ionViewWillEnter(){
    this.loadItems();
  }

  onAddItem(form: NgForm) {
    this.slService.addItem(form.value.ingredientName, form.value.amount);
    form.reset();
    this.loadItems();
  }

  onCheckItem(index: number){
    this.slService.removeItem(index);
    this.loadItems();//ker je neka spremnlo
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
              this.slService.fetchList(token).subscribe(
                (list: Ingredient[]) => {
                  loading.dismiss();
                  if(list){
                    this.listItems = list;
                  }
                  else{
                    this.listItems = [];
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
              this.slService.storeList(token).subscribe(
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

  private loadItems(){
    this.listItems = this.slService.getItems();
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
