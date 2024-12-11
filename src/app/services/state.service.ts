import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { IProduct, Menu, IOrderPosition, IOrder, IPosterOrder, IPosterOrderProduct, IGuest, INewPosterOrderPosition } from '../models/models';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../components/dialog/dialog.component';
import { Router } from '@angular/router';
import { LoadingService } from './loading.service';
import { DialogService } from './dialog.service';
import { getCurrentDate } from '../utils/utils';


@Injectable({
  providedIn: 'root'
})
export class StateService {
  categories: { id: string, label: string; icon: string; active: boolean }[] = [];
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
  isCartPage = false;
  $init = new Subject<boolean>();
  order: IOrder = {
    positions: [],
    total: 0,
  };
  currentOrder: IOrder = {
    id: undefined,
    positions: [],
    total: 0,
  };

  constructor(private apiService: ApiService, public dialogService: DialogService, private loadingService: LoadingService) { }

  async init() {
    this.loadingService.show();

    const menu = await this.apiService.getMenu();
    if (!menu) {
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
        modifications: product.modifications.map(modification => ({ ...modification, count: 0, total: 0 }))
      }
      );
      this.productsMap.set(product.product_id, product);
    })
    const tables = await this.apiService.getTables();
    if (!tables) {
      this.dialogService.popUp({ errorMessage: 'Something went wrong with tables :-(' }, "Ok");
      return
    }
    tables.forEach(table => {
      this.tableIdsMap.set(table.name, table.id)
    })
    const cachedGuestId = localStorage.getItem('pasijou_guest_id');
    if (cachedGuestId) {
      const guest = await this.apiService.getGuestById(cachedGuestId);
      if (guest) {
        this.setGuest(guest);
      }
    }
    await this.checkOrder();
    this.loadingService.hide();
    this.$init.complete();
  }

  public async checkOrder(): Promise<void> {
    const currentOrderString = localStorage.getItem('pasijou_current_order');
    if (currentOrderString) {
      const currentOrderParsed = JSON.parse(currentOrderString);
      const currentOrder = await this.apiService.getOrder(currentOrderParsed.id!);
      if (currentOrderParsed.date === getCurrentDate() && !currentOrder) {
        this.currentOrder = currentOrderParsed;
        return;
      }
    }
    this.currentOrder = {
      id: undefined,
      positions: [],
      total: 0,
    };
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

  async createOrder(orderInfo: Pick<IPosterOrder, 'tableId' | 'comment'>) {
    const order: IPosterOrder = {
      ...orderInfo,
      spotId: environment.spot_id,
      waiterId: 6,
      client: { id: this.client_id },
      autoAccept: true,
      products: this.order.positions.map(position => {
        const product: IPosterOrderProduct = {
          id: position.product_id,
          count: position.count,
          modification: position.modifications.filter(modification => modification.count).map(modification => ({ id: modification.dish_modification_id, count: modification.count })),
        }
        if (position.comment) {
          product.comment = position.comment;
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
    // ToDo Включить обратно, когда заказы автоматически будут уходить на кухню
    // this.currentOrder.id = String(createdOrder.id);
    // this.currentOrder.positions = this.order.positions;
    // this.currentOrder.total = this.order.total;
    // this.currentOrder.date = getCurrentDate();
    // this.currentOrder.comment = this.orderComment;
    // localStorage.setItem('pasijou_current_order', JSON.stringify(this.currentOrder));
    this.clearStateOrder();
    return createdOrder;
  }

  async updateOrder() {
    const updates = this.order.positions.map(position => {
      const newPosition: INewPosterOrderPosition = {
        spot_id: environment.spot_id,
        spot_tablet_id: '1',
        transaction_id: this.currentOrder.id!,
        product_id: position.product_id,
        count: position.count,
      }
      if(position.modifications.length){
        newPosition.modification = JSON.stringify(position.modifications.filter(modification => modification.count).map(modification => ({ m: modification.dish_modification_id, a: modification.count })));
      }
      return this.apiService.addPositionToOrder(newPosition)
    })
    await Promise.all(updates);
    this.order.positions.forEach(position => {
      const currentPosition = this.currentOrder.positions.find(pos => pos.product_id === position.product_id);
      if (currentPosition){
        currentPosition.count += position.count;
        currentPosition.total += position.total;
        if (currentPosition.discountPrice){
          currentPosition.discountPrice += position.discountPrice!;
        }
        currentPosition.modifications.forEach(currentModification => {
          const addedModification = position.modifications.find(m => m.dish_modification_id === currentModification.dish_modification_id);
          if (addedModification){
            currentModification.count += addedModification.count;
            currentModification.total += addedModification.total;
            if (currentModification.discountPrice){
              currentModification.discountPrice += addedModification.discountPrice!;
            }
          }
        })
      } else {
        this.currentOrder.positions.push(position)
      }
    })
    this.currentOrder.total += this.order.total;
    this.currentOrder = Object.assign({}, this.currentOrder);
    localStorage.setItem('pasijou_current_order', JSON.stringify(this.currentOrder));
    this.clearStateOrder();
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
    if (this.discount) {
      this.recalculatePrices()
    }
    localStorage.setItem('pasijou_guest_id', this.client_id);
  }

  recalculatePrices() {
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

  public getIcon(category: string) {
    // @ts-ignore
    return "fa-solid " + environment.categoriesIcons[category.toLowerCase()] || '';
  }

}
