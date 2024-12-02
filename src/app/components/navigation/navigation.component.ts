import { Component, OnInit } from '@angular/core';
import { StateService } from '../../services/state.service';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { getElementHeight } from '../../utils/utils';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss'
})
export class NavigationComponent {

  iconPrefix = environment.iconPrefix;

  constructor(public stateService: StateService, private router: Router) {}

  goToCategory(id: string){
    if(this.stateService.isHomePage){
      this.scrollToCategory(id);
    }else {
      this.router.navigate(['/table', this.stateService.table || '0']).then(() => {
        setTimeout(() => this.scrollToCategory(id, true));
      });
    }
  }

  goToCart(){
    this.stateService.categories.forEach(category => category.active = false);
    this.router.navigate(['/cart']);
  }

  private scrollToCategory(id: string, fast = false) {
    const element = document.getElementById(id)!;
    const headerHeight = getElementHeight('app-header');
    const y = element.getBoundingClientRect().top + window.scrollY - headerHeight;
    window.scrollTo({ top: y, behavior: fast?  'instant' : 'smooth' });
  }

}
