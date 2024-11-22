import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { IProduct, Menu, IOrderPosition, IOrder, IPosterOrder, IPosterOrderProduct, IGuest } from '../models/models';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../components/dialog/dialog.component';
import { Router } from '@angular/router';
import { LoadingService } from './loading.service';
import { DialogService } from './dialog.service';


@Injectable({
  providedIn: 'root'
})
export class StateService {
  productsMap = new Map<string, IProduct>();
  ordersPositionsMap = new Map<string, IOrderPosition>();
  menu: Menu = [];
  table: string = '';
  guestName: string = '';
  client_id: string = '0';
  orderComment: string = '';
  discount = 0;
  $init = new Subject<boolean>();
  order: IOrder = {
    positions: [],
    total: 0,
  };

  constructor(private apiService: ApiService, public dialogService: DialogService,  private loadingService: LoadingService) { }

  async init() {
    this.loadingService.show();

    const menu = await this.apiService.getMenu();
    if(!menu){
      return;
    }
    this.menu = menu;
    menu.map(category => category.products).flat().forEach(product => {
      this.ordersPositionsMap.set(product.product_id, {
        product_id: product.product_id,
        price: product.price,
        name: product.product_name,
        count: 0,
        total: 0,
        modifications: product.modifications.map(modification => ({...modification, count: 0, total: 0}))
      }
      );
      this.productsMap.set(product.product_id, product);
    })
    const cachedGuest = localStorage.getItem('guest');
    if(cachedGuest){
      const {name, id, discount} = JSON.parse(cachedGuest);
      this.guestName = name;
      this.client_id = id;
      this.discount = discount;
    }
    this.loadingService.hide();
    this.$init.complete();
  }

  public getProduct(id: string): IProduct {
    return this.productsMap.get(id) as IProduct;
  }
  public getOrderPosition(id: string): IOrderPosition {
    return this.ordersPositionsMap.get(id) as IOrderPosition;
  }

  public recountOrder(orderPosition: IOrderPosition) {
    orderPosition.modifications.forEach(modification => modification.total = modification.count * modification.price);
    orderPosition.total = (orderPosition.count * orderPosition.price + orderPosition.modifications.reduce((sum, modification) => sum += modification.total, 0));
    orderPosition.total = orderPosition.total * (100 - this.discount) / 100;
    if (orderPosition.count === 0) {
      this.order.positions = this.order.positions.filter(position => position.product_id !== orderPosition.product_id);
    } else if (!this.order.positions.find(position => position.product_id === orderPosition.product_id)) {
      this.order.positions.push(orderPosition);
    }

    this.order.total = this.order.positions.reduce((sum, position) => sum += position.total, 0);
  }

  async createOrder(orderInfo: Pick<IPosterOrder, 'tableId'>) {
    const order: IPosterOrder = {
      ...orderInfo,
      spotId: environment.spot_id,
      waiterId: 6,
      client: {id : this.client_id},
      products: this.order.positions.map(position => {
        const product: IPosterOrderProduct = {
          id: position.product_id,
          count: position.count,
          modification: position.modifications.filter(modification => modification.count).map(modification => ({ id: modification.dish_modification_id, count: modification.count })),
        }
        if(environment.flags.clientCountPrice) {
          product.price = position.total / 100;
        }
        return product;
      })

    }
    this.table = order.tableId;
    this.loadingService.show();
    const createdOrder = await this.apiService.createOrder(order);
    this.loadingService.hide()
    if (!createdOrder) {
      return null;
    }
    this.clearStateOrder();
    return createdOrder;
  }

  private clearStateOrder() {
    this.orderComment = '';
    this.order.positions = [];
    this.order.total = 0;
    [...this.ordersPositionsMap.values()].forEach(orderPosition => {
      orderPosition.count = 0;
      orderPosition.total = 0;
      orderPosition.modifications.forEach(modification => {
        modification.count = 0;
        modification.total = 0;
      })
    });
  }

  setGuest(guest: IGuest) {
    this.guestName = guest.name;
    this.client_id = guest.id;
    this.discount = Number(guest.discount);
    localStorage.setItem('guest', JSON.stringify({id: this.client_id}));
  }

}
