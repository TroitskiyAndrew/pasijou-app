import { CurrencyPipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'price',
})
export class PricePipe implements PipeTransform {

  constructor(){

  }

  transform(value: number): string {
    value = value / 100;
    const regex = /(\d)(?=(\d{3})+$)/g;
    const result = value.toString().replace(regex, '$1,');
    return result + ' Rs';
  }

}
