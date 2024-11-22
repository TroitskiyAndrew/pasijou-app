import { Component } from '@angular/core';
import { StateService } from '../../services/state.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {

  constructor(public stateService: StateService, private router: Router){}

  goToCart(){
    this.router.navigate(['/cart']);
  }

}
