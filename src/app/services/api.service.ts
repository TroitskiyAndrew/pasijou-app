import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { ICategory, IGuest, IOrder, IPosterOrder, IProduct, ITable, Menu } from '../models/models';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DialogComponent } from '../components/dialog/dialog.component';
import { StateService } from './state.service';
import { DialogService } from './dialog.service';
import { LoadingService } from './loading.service';

@Injectable({
  providedIn: 'root',
})
export class ApiService {

  constructor(private http: HttpClient, private dialogService: DialogService, private router: Router, private loadingService: LoadingService) { }

  private getErrorHandler({ value, message, btnText }: { value?: any, message?: string, btnText?: string }) {
    return async () => {
      this.loadingService.hide();
      await this.dialogService.popUp({ errorMessage: message || 'Something went wrong :-(' }, btnText || "Ok");
      return value;
    }
  }

  public getMenu(): Promise<Menu> {
    const url = `${environment.apiUrl}/menu`;
    return this.http
      .get<Menu>(url)
      .toPromise()
      .then((data?: Menu) => {
        return (data ?? [])
          .map((category) => ({
            category_id: category['category_id'],
            category_name: category['category_name'].trim(),
            category_photo: 'https://joinposter.com' + category['category_photo'],
            products: category['products'].map(product => {
              //@ts-ignore;
              const { spots, group_modifications } = product;
              const price = spots.find(spot => spot.spot_id === environment.spot_id)!.price;
              const modifications = (group_modifications ?? [])
                .filter((group: Record<string, any>) => group['is_deleted'] == '0')
                .map((group: Record<string, any>) => group['modifications'])
                .flat()
                .map((modification: Record<string, any>) => ({
                  dish_modification_id: modification['dish_modification_id'],
                  name: modification['name'],
                  price: modification['price'] * (environment.flags.modificationPrice ? 100 : 1),
                  photoUrl: modification['photo_small'],
                }));
              return {
                product_id: product['product_id'],
                menu_category_id: product['menu_category_id'],
                product_name: product['product_name'].trim(),
                price: price ? Number(price) : 99999,
                //@ts-ignore;
                ingredients: (product['ingredients'] ?? []).map((ingredient: Record<string, any>) => ingredient['ingredient_name']),
                //@ts-ignore;
                photoUrl: 'https://joinposter.com' + product['photo'],
                modifications,
                cooking_time: product['cooking_time'] != null ? (Number(product['cooking_time']) / 60) : 99,
                product_production_description: product['product_production_description'],
                spots: product['spots'],
              }
            }),
          }))
      }
      ).catch(this.getErrorHandler({ value: null, message: 'Fail to load menu', btnText: "Ok, I'll try later" }));
  }


  public createOrder(order: IPosterOrder): Promise<IOrder> {
    const url = `${environment.apiUrl}/order`;
    return this.http.post(url, order).toPromise()
      .then(order => {
        // ToDo валидация ответов о неправильном заказе
        return order;
      }).catch(this.getErrorHandler({ value: null, message: 'Fail to create order', btnText: "Ok, I'll try later" }));
  }

  public getGuest(phone: string): Promise<IGuest | undefined | null> {
    const url = `${environment.apiUrl}/guests/phone/${phone}`;
    return this.http
      .get<Record<string, any>>(url)
      .toPromise().then(this.mapGuest)
      .catch(this.getErrorHandler({ value: null, message: 'Fail to find guest account', btnText: "Ok, I'll try later" }));
  }

  public getGuestById(id: string): Promise<IGuest | undefined | null> {
    const url = `${environment.apiUrl}/guests/id/${id}`;
    return this.http
      .get<Record<string, any>>(url)
      .toPromise().then(this.mapGuest)
      .catch(this.getErrorHandler({ value: null, message: 'Fail to find guest account', btnText: "Ok, I'll try later" }));
  }

  private mapGuest(guest: Record<string, any> | undefined) {
    return guest ? {
      id: guest!['client_id'],
      name: [guest!['firstname'], guest!['lastname']].filter(Boolean).join(' '),
      discount: Number(guest['discount_per'] || guest!['client_groups_discount'] || '0'),
    } : undefined
  }

  public createGuest(phone: string, client_name: string): Promise<{ client_id: string }> {
    const url = `${environment.apiUrl}/guests/create`;
    return this.http
      .post<{ client_id: string }>(url, { client_name, client_groups_id_client: '1', phone })
      .toPromise()
      .catch(this.getErrorHandler({ value: null, message: 'Fail to create account', btnText: "Ok, I'll try later" }));
  }

  public sendCode(phone: string): Promise<boolean> {
    const url = `${environment.apiUrl}/auth/${phone}`;
    return this.http
      .get<boolean>(url)
      .toPromise()
      .catch(this.getErrorHandler({ value: '', message: 'Fail to send code', btnText: "Ok, I'll try later" }));
  }
  public checkCode(phone: string, code: string): Promise<boolean> {
    const url = `${environment.apiUrl}/auth`;
    return this.http
      .post<boolean>(url, { phone, code })
      .toPromise()
      .catch(this.getErrorHandler({ value: '', message: 'Fail to check code', btnText: "Ok, I'll try later" }));
  }

  public getTables(): Promise<ITable[] | null> {
    const url = `${environment.apiUrl}/tables`;
    return this.http
      .get<Record<string, string>[]>(url)
      .toPromise().then(tables => tables?.map(table => ({
        id: table['table_id'],
        name: table['table_num'],
      })) || null)
      .catch(this.getErrorHandler({ value: null, message: 'Fail to find guest account', btnText: "Ok, I'll try later" }));
  }

}
