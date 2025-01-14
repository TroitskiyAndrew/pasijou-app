import { TemplateRef } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";


export interface ICategory {
  category_id: string;
  category_name: string;
  category_photo_origin: string | null;
  products: IProduct[];
}

export interface IPrice {
  price: number;
  discountPrice?: number;
}

export interface IModification {
  dish_modification_id: string;
  name: string;
  price: number;
  discountPrice?: number;
  photoUrl: string | null;
}

export interface IProduct {
  product_id: string;
  menu_category_id: string;
  product_name: string;
  price: number;
  discountPrice?: number;
  product_production_description: '';
  ingredients: string[];
  photoUrl: string | null;
  modifications: IModification[];
  cooking_time: number;
  spots: {spot_id: string, visible: string, price: string}[];
}

export type Menu = (ICategory & {products: IProduct[]})[]

export interface IOrderPosition {
  product_id: string;
  name: string;
  price: number;
  discountPrice?: number;
  count: number;
  total: number;
  modifications: (IModification & {count: number; total: number})[];
  comment?: string;
}

export interface IOrder {
  positions: IOrderPosition[],
  total: number;
  id?: string;
  date?: string;
  time?: string;
  comment?: string;
}
export interface IOrder {
  positions: IOrderPosition[],
  total: number;
}

export interface IPosterOrderProduct {
  id: string;
  count: number;
  modification?: { id: string, count: number }[];
  price?: number,
  comment?: string;
}

export interface IPosterOrder {
  id?: number;
  spotId: string;
  tableId: string;
  waiterId: number;
  autoAccept: boolean;
  products: IPosterOrderProduct[];
  client: {id: string};
  comment: string;
  payed_sum?: string;
  transaction_id?: string;
}
export interface INewPosterOrderPosition {
  spot_id: string;
  spot_tablet_id: string;
  transaction_id: string;
  product_id: string;
  count: number;
  modification?: string;
}

export interface IDialogField {
  id: string;
  label: string;
  control: FormControl
}

export interface IDialogButton {
  label: string;
  action: () => Promise<any> | any;
  disabled: () => boolean;
  class?: string
}

export interface DialogData {
  init?: () => void;
  title?: string;
  message?: string;
  errorMessage?: string;
  fields?: IDialogField[];
  buttons: IDialogButton[];
  template?: TemplateRef<any>;
}


export interface IGuest {
  id: string;
  name: string;
  discount: number;
}

export interface ITable {
  id: string;
  name: string;
}
