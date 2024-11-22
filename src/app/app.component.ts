import { HttpClientModule } from '@angular/common/http';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { ApiService } from './services/api.service';
import { StateService } from './services/state.service';
import { HeaderComponent } from "./components/header/header.component";
import { ProductListComponent } from "./components/product-list/product-list.component";
import { getElementHeight } from './utils/utils';

@Component({
  selector: 'app-root',
  providers: [ApiService, StateService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'pasijou-app';

  constructor(private stateService: StateService){

  }

  ngOnInit(): void {
    this.stateService.init();
  }

  ngAfterViewInit(): void {
    const main = document.querySelector('main') as HTMLElement;
    const footerHeight = getElementHeight('app-footer');
    main.style.paddingBottom = `${footerHeight}px`;
  }
}
