import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
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
  window = window;
  showPayPal = false

  @ViewChild('waitMessageTemplate', { static: true }) waitMessageTemplate!: TemplateRef<any>;

  constructor(public stateService: StateService, public dialogService: DialogService, private router: Router, private changeDetection: ChangeDetectorRef) { }

  async ngOnInit(): Promise<void> {
    this.stateService.isHomePage = false;
    this.stateService.isCartPage = true;
    await this.stateService.checkOrder();
    document.querySelector('.nav__cart__button')?.classList.add('active');
  }

  async createOrder() {
    const res = await this.stateService.checkCurrentOrder();
    if(!res){
      await this.dialogService.popUp({errorMessage: "Something went wrong, try later"});
      return;
    }
    if(Array.isArray(res)){
      await this.dialogService.popUp({errorMessage: `Sorry, but ${res.map(position => position.name).join(', ')} ${res.length > 1 ? "aren't" : "isn't"} available at the moment`});
      return;
    }
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
          this.stateService.guestName = nameField.control.value ?? '';
          const comment = `${this.stateService.guestName}; ${this.stateService.orderComment}`;
          return this.stateService.createOrder({ tableId, comment });
        },
      },
      ]
    });
    this.router.navigate(['/cart']);
    if(order == null){
      return;
    }
    await this.dialogService.popUp({message: "We've already stared cooking your order", template: this.waitMessageTemplate}, 'Nice')
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

  getCurrentOrdersTotal() {
    return this.stateService.currentOrders.reduce((acc, order) => acc + order.total, 0)
  }

  ngOnDestroy(): void {
    this.stateService.isCartPage = false;
    document.querySelector('.nav__cart__button')?.classList.remove('active');
  }

}
