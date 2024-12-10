import { Component } from '@angular/core';
import { StateService } from '../../services/state.service';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-cart-button',
  templateUrl: './cart-button.component.html',
  styleUrl: './cart-button.component.scss'
})
export class CartButtonComponent {

  iconPrefix = environment.iconPrefix;

  constructor(public stateService: StateService, private router: Router) {}

  goToCart(){
    this.stateService.categories.forEach(category => category.active = false);
    this.router.navigate(['/cart']);
  }

}
