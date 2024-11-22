import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductListComponent } from './components/product-list/product-list.component';
import { ProductDetailsComponent } from './components/product-details/product-details.component';
import { CartComponent } from './components/cart/cart.component';

const routes: Routes = [
  {
    path: 'table/:table',
    component: ProductListComponent
  },
  {
    path: 'table',
    component: ProductListComponent
  },
  {
    path: 'product/:id',
    component: ProductDetailsComponent
  },
  {
    path: 'cart',
    component: CartComponent,
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'table/'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
