import { Component, EventEmitter, Input, OnDestroy, OnInit } from '@angular/core';
import { IOrderPosition, IProduct } from '../../models/models';
import { StateService } from '../../services/state.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Location } from '@angular/common';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.scss'
})
export class ProductDetailsComponent {

  subs = new Subscription();

  product?: IProduct;
  orderPosition!: IOrderPosition;

  constructor(public stateService: StateService, private route: ActivatedRoute, private location: Location) {}

  ngOnInit(): void {
    this.subs = this.stateService.$init.subscribe({complete: () => {
      const productId = this.route.snapshot.params['id'];
      this.product = this.stateService.getProduct(productId);
      this.orderPosition = this.stateService.getOrderPosition(productId);
    }});
    this.stateService.isHomePage = false;
    this.stateService.categories.forEach(category => category.active = false);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

}
