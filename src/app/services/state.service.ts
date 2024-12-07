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
  categories: {id: string, label: string; icon: string; active: boolean}[] = [];
  productsMap = new Map<string, IProduct>();
  ordersPositionsMap = new Map<string, IOrderPosition>();
  tableIdsMap = new Map<string, string>();
  menu: Menu = [];
  table: string = '';
  guestName: string = '';
  client_id: string = '18';
  orderComment: string = '';
  discount = 0;
  isHomePage = true;
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
    menu.forEach(cat => {
      cat.products = cat.products.filter(product => {
        return product.spots.find(spot => spot.spot_id === environment.spot_id && spot.visible === '1')
      })
    })
    this.menu = menu;
    this.categories = this.menu.map(category => ({
      id: category.category_id,
      label: category.category_name,
      icon: `${environment.iconPrefix} ${this.getIcon(category.category_name)}`,
      active: false,
    }))
    this.categories[0].active = true;
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
    const tables = await this.apiService.getTables();
    if(!tables){
      this.dialogService.popUp({ errorMessage: 'Something went wrong with tables :-(' }, "Ok");
      return
    }
    tables.forEach(table => {
      this.tableIdsMap.set(table.name, table.id)
    })
    const cachedGuestId = localStorage.getItem('pasijou_guest_id');
    if(cachedGuestId){
      const guest = await this.apiService.getGuestById(cachedGuestId);
      if(guest){
        this.setGuest(guest);
      }
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
      autoAccept: true,
      products: this.order.positions.map(position => {
        const product: IPosterOrderProduct = {
          id: position.product_id,
          count: position.count,
          modification: position.modifications.filter(modification => modification.count).map(modification => ({ id: modification.dish_modification_id, count: modification.count })),
        }
        if(environment.flags.clientCountPrice && this.discount) {
          product.price = position.total / 100;
        }
        return product;
      })

    }
    this.table = order.tableId;
    order.tableId = this.tableIdsMap.get(order.tableId)!;
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
    if(this.discount){
      this.recalculatePrices()
    }
    localStorage.setItem('pasijou_guest_id', this.client_id);
  }

  recalculatePrices(){
    this.menu.map(category => category.products).flat().forEach(product => {
      product.discountPrice = Math.floor(product.price * (100 - this.discount) / 100);
      product.modifications.forEach(modification => {
        modification.discountPrice = Math.floor(modification.price * (100 - this.discount) / 100);
      })
    });
    [...this.ordersPositionsMap.values()].forEach(position => {
      position.discountPrice = Math.floor(position.price * (100 - this.discount) / 100);
      position.modifications.forEach(modification => {
        modification.discountPrice = Math.floor(modification.price * (100 - this.discount) / 100);
      })
    })
  }

  public getIcon(category: string){
    // @ts-ignore
    return "fa-solid " + environment.categoriesIcons[category.toLowerCase()] || '';
  }

}
