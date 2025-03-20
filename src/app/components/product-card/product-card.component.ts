import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { IOrderPosition, IProduct } from '../../models/models';
import { Router } from '@angular/router';
import { StateService } from '../../services/state.service';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss'
})
export class ProductCardComponent implements AfterViewInit{
  @Input() product!: IProduct;
  countChanged = false;
  orderPosition!: IOrderPosition

  constructor(public stateService: StateService, private router: Router){}

  ngAfterViewInit(): void {
    this.orderPosition = this.stateService.getOrderPosition(this.product.product_id)
  }


  openProduct(){
    this.router.navigate(['/product', this.product.product_id]);
  }


}
