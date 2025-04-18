import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../dialog/dialog.component';
import { AbstractControl, FormControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { StateService } from '../../services/state.service';
import { ApiService } from '../../services/api.service';
import { LoadingService } from '../../services/loading.service';
import { DialogService } from '../../services/dialog.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent {

  iconPrefix = environment.iconPrefix;

  constructor(private dialogService: DialogService, private apiService: ApiService, public stateService: StateService, private loadingService: LoadingService) { }

  async login() {
    const phone = await this.getPhone();
    if (phone == null) {
      return;
    }
    const isAuthenticated = await this.authenticate(phone);
    if (!isAuthenticated) {
      return;
    }

    this.loadingService.show();
    const guest = await this.apiService.getGuest(phone);
    if(guest === null){
      return;
    }
    this.loadingService.hide();
    if (guest) {
      this.stateService.setGuest(guest);
      this.dialogService.popUp({ message: `Welcome back, ${guest.name}` });
      return;
    }
    const name = await this.getGuestData();
    if (name == null) {
      return;
    }
    let client_id = '';
    this.loadingService.show()
    client_id = await this.apiService.createGuest(phone, name).then(({client_id}) => client_id);
    this.loadingService.hide();
    if(client_id === null){
      return;
    }
    this.stateService.setGuest({ id: client_id, name, discount : 0 });
    this.dialogService.popUp({message: 'Nice to meet you'}, "Let's go");
  }

  private async authenticate(phone: string): Promise<boolean> {
    this.loadingService.show()
    const isCodeSended = await  this.apiService.sendCode(phone);
    this.loadingService.hide();
    if(!isCodeSended){
      return false;
    }
    const codeField = { id: 'code', label: '', control: new FormControl('', Validators.required) }
    return this.dialogService.init({
      message: 'Type code from message',
      fields: [codeField],
      buttons: [{
        label: 'Check code',
        disabled: () => codeField.control.invalid,
        action: async () => {
          const isAuthenticated = await this.apiService.checkCode(phone, codeField.control.value as string)
          if (!isAuthenticated) {
            throw new Error('Wrong code')
          }
          return isAuthenticated;
        },
      },
      {
        label: 'Cancel',
        disabled: () => false,
        action: () => false,
        class: 'cancel'
      }
      ]
    });
  }

  private getPhone(): Promise<string | null> {
    const phoneField = { id: 'phone', label: '', control: new FormControl('+', [Validators.required,Validators.minLength(10), Validators.pattern(/^\+\d*$/)]) };
    return this.dialogService.init({
      init: () => {
        phoneField.control.valueChanges.subscribe((value) => {
          if (value && !value.startsWith('+')) {
            phoneField.control.setValue('+' + value.replace(/[^0-9]/g, ''), {
              emitEvent: false,
            });
          } else if (!value) {
            phoneField.control.setValue(
              '+',
              { emitEvent: false }
            );
          }
        });
      },
      message: 'Type your WhatsApp number, please',
      fields: [phoneField],
      buttons: [{
        label: 'Send code',
        disabled: () =>  phoneField.control.invalid,
        action: () => (phoneField.control.value as string).replace(/[^+\d]/g, '') ,
      },
      {
        label: 'Cancel',
        disabled: () => false,
        action: () => null,
        class: 'cancel'
      }
      ]
    });
  }

  private getGuestData(): Promise<string | null> {
    const nameField = { id: 'name', label: 'Your Name', control: new FormControl('', Validators.required) };
    return this.dialogService.init({
      message: "We don't know you :-(",
      fields: [nameField],
      buttons: [{
        label: 'Become our friend',
        disabled: () => nameField.control.invalid,
        action: () => nameField.control.value,
      },
      {
        label: 'Maybe later',
        disabled: () => false,
        action: () => null,
        class: 'cancel'
      }
      ]
    });
  }


}
