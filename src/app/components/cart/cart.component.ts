import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { StateService } from '../../services/state.service';
import { Location } from '@angular/common';
import { FormControl, Validators } from '@angular/forms';
import { DialogService } from '../../services/dialog.service';
import { Router } from '@angular/router';
import { IOrderPosition } from '../../models/models';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent  implements OnInit, OnDestroy{

  constructor(public stateService: StateService, public dialogService: DialogService, private router: Router, private changeDetection: ChangeDetectorRef) { }

  async ngOnInit(): Promise<void> {
    this.stateService.isHomePage = false;
    this.stateService.isCartPage = true;
    await this.stateService.checkOrder();
    document.querySelector('.nav__cart__button')?.classList.add('active');
  }

  async createOrder() {
    const tableField = { id: 'table', label: 'Table', control: new FormControl(this.stateService.table || '', Validators.required) };
    const nameField = { id: 'name', label: 'Name', control: new FormControl(this.stateService.guestName || '', Validators.required) };
    const commentField = { id: 'comment', label: 'Comment', control: new FormControl(this.stateService.orderComment || '') };

    const fields = [tableField,nameField, commentField];

    const order = await this.dialogService.init({
      fields,
      buttons: [
        {
          label: 'Later',
          disabled: () => false,
          action: () => null,
          class: 'cancel'
        },
        {
        label: 'Yes',
        disabled: () => fields.some(field => field.control.invalid),
        action: () => {
          const tableId = tableField.control.value as string;
          this.stateService.orderComment = commentField.control.value ?? '';
          return this.stateService.createOrder({ tableId, comment: this.stateService.orderComment });
        },
      },
      ]
    });
    this.router.navigate(['/cart']);
    if(order == null){
      return;
    }
    await this.dialogService.popUp({message: "We've already stared cooking your order"}, 'Nice')
  }

  async updateOrder(){
    await this.dialogService.init({
      message: 'Are you sure?',
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
          return this.stateService.updateOrder();
        },
      },
      ]
    });
    await this.stateService.checkOrder();
  }

  setProductComment(event: Event, position: IOrderPosition){
    position.comment = (event.target as HTMLInputElement).value;
  }

  ngOnDestroy(): void {
    this.stateService.isCartPage = false;
    document.querySelector('.nav__cart__button')?.classList.remove('active');
  }

}
