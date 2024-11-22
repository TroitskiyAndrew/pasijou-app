import { AfterViewInit, Component, HostListener, Input, Output } from '@angular/core';
import { IModification, IOrderPosition, IProduct } from '../../models/models';
import { StateService } from '../../services/state.service';

@Component({
  selector: 'app-product-buttons',
  templateUrl: './product-buttons.component.html',
  styleUrl: './product-buttons.component.scss'
})
export class ProductButtonsComponent implements AfterViewInit{
  @Input() productId!: string;
  @Input() withTotal = false;
  @HostListener('click', ['$event']) blockClicks(event: MouseEvent) {
    event.stopPropagation();
  }
  orderPosition!: IOrderPosition;

  constructor(private stateService: StateService){}

  ngAfterViewInit(): void {
    setTimeout(() => this.orderPosition = this.stateService.getOrderPosition(this.productId));
  }

  changeAmount(change: number){
    if(this.orderPosition.count + change === -1){

      return;
    } else if (this.orderPosition.count + change === 0){
      this.orderPosition.modifications.forEach(modification => modification.count = 0);
    }
    this.orderPosition.count += change;
    this.orderPosition.total += this.orderPosition.count * this.orderPosition.price;
    this.stateService.recountOrder(this.orderPosition);
  }

  changeModification(dish_modification_id: string, change: number){
    const modification =  this.orderPosition.modifications.find((modification: IModification) => modification.dish_modification_id === dish_modification_id)!;
    if(modification.count + change === -1 || this.orderPosition.count === 0){
      return;
    }
    modification.count += change;
    modification.total = modification.count * modification.price;
    this.stateService.recountOrder(this.orderPosition);
  }
}
