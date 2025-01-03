import { Component } from '@angular/core';
import { StateService } from '../../services/state.service';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { ApiService } from '../../services/api.service';
import { DialogService } from '../../services/dialog.service';

@Component({
  selector: 'app-cart-button',
  templateUrl: './cart-button.component.html',
  styleUrl: './cart-button.component.scss'
})
export class CartButtonComponent {

  iconPrefix = environment.iconPrefix;

  constructor(public stateService: StateService, private router: Router, private apiService: ApiService, public dialogService: DialogService) {}

  goToCart(){
    this.stateService.categories.forEach(category => category.active = false);
    this.router.navigate(['/cart']);
  }

  async callWaiter(){
    await this.dialogService.init({
      message: 'Do you want to call a waiter?',
      buttons: [
        {
          label: 'Later',
          disabled: () => false,
          action: () => null,
          class: 'cancel'
        },
        {
        label: 'Yes',
        disabled: () => false,
        action: () => {
          return this.apiService.callWaiter(this.stateService.table);
        },
      },
      ]
    });
  }

}
