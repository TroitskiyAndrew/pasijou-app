import { Component, OnInit } from '@angular/core';
import { StateService } from '../../services/state.service';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { ProductCardComponent } from "../product-card/product-card.component";
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { getElementHeight, setPaddingTop } from '../../utils/utils';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent implements OnInit{

  constructor(public stateService: StateService, private route: ActivatedRoute) {

  }

  ngOnInit(): void {
    if(!this.stateService.table){
      this.stateService.table = this.route.snapshot.params['table'] || null;
    }
    setPaddingTop('.menu__tabs');
  }


  scrollTo(id: any) {
    const element = document.getElementById(id)!;
    const tabsHeight = getElementHeight('.menu__tabs');
    const y = element.getBoundingClientRect().top + window.scrollY - tabsHeight;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }

}
