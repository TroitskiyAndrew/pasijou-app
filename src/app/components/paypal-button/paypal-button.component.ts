import { AfterViewInit, Component } from '@angular/core';
declare const paypal: any;

@Component({
  selector: 'app-paypal-button',
  templateUrl: './paypal-button.component.html',
  styleUrl: './paypal-button.component.scss'
})
export class PaypalButtonComponent implements AfterViewInit {
  ngAfterViewInit() {
    paypal.Buttons({
      createOrder: (data: any, actions: any) => {
        return actions.order.create({
          purchase_units: [
            {
              amount: {
                value: '1.00', // Укажите сумму платежа
              },
              description: 'Оплата услуг', // Описание покупки
              custom_id: 'ORDER12345', // Кастомный идентификатор заказа
              soft_descriptor: 'Компания XYZ', // Краткое описание, отображаемое в выписке
            },
          ],
          application_context: {
            shipping_preference: 'NO_SHIPPING', // Скрыть адрес доставки
            user_action: 'PAY_NOW', // Сразу переходить к оплате
          },
        });
      },
      onApprove: (data: any, actions: any) => {
        return actions.order.capture().then((details: any) => {
          console.log('Transaction completed by', details.payer.name.given_name);
        });
      },
      onError: (err: any) => {
        console.error('Error during the transaction', err);
      },
    }).render('#paypal-button-container').then(() => {
      const inputElement = document.querySelector('№billingAddress.givenName') as HTMLInputElement;
      if (inputElement) {
        inputElement.value = 'New Value'; // Меняем значение
      }
    });
  }
}
