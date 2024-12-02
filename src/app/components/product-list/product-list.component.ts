import { Component, OnDestroy, OnInit } from '@angular/core';
import { StateService } from '../../services/state.service';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { ProductCardComponent } from "../product-card/product-card.component";
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { getElementHeight } from '../../utils/utils';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent implements OnInit, OnDestroy{

  handler!: () => void;

  constructor(public stateService: StateService, private route: ActivatedRoute) {

  }

  ngOnInit(): void {
    if(!this.stateService.table){
      this.stateService.table = this.route.snapshot.params['table'] || null;
    }
    this.stateService.isHomePage = true;
    this.handler = this.handleScroll.bind(this);
    window.addEventListener('scroll', this.handler);
  }

  handleScroll(){
    const categories = document.querySelectorAll('.menu__category');
    let id = '';
    const line = getElementHeight('app-header')
    categories.forEach(category => {
      if(category.getBoundingClientRect().top <= line){
        id = category.id
      }
    })
    if(id){
      this.stateService.categories.forEach(category => category.active = category.id === id)
    }

  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.handler);
  }

}
