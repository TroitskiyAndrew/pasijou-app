import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ProductCardComponent } from './components/product-card/product-card.component';
import { ProductListComponent } from './components/product-list/product-list.component';
import { ProductDetailsComponent } from './components/product-details/product-details.component';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { CartComponent } from './components/cart/cart.component';
import { ProductButtonsComponent } from './components/product-buttons/product-buttons.component';
import { MatDialogModule } from '@angular/material/dialog';
import { DialogComponent } from './components/dialog/dialog.component';
import { LoadingOverlayComponent } from './components/loading-overlay/loading-overlay.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthComponent } from './components/auth/auth.component';
import { NavigationComponent } from './components/navigation/navigation.component';
import { PricePipe } from './pipes/price.pipe';
import { CartButtonComponent } from './components/cart-button/cart-button.component';
import { PaypalButtonComponent } from './components/paypal-button/paypal-button.component';
@NgModule({
  declarations: [
    AppComponent,
    ProductDetailsComponent,
    ProductListComponent,
    ProductCardComponent,
    ProductButtonsComponent,
    ProductListComponent,
    ProductDetailsComponent,
    HeaderComponent,
    CartComponent,
    DialogComponent,
    LoadingOverlayComponent,
    AuthComponent,
    NavigationComponent,
    CartButtonComponent,
    PricePipe,
    PaypalButtonComponent
  ],
  providers: [],
  imports: [
    BrowserModule,
    RouterModule,
    AppRoutingModule,
    ReactiveFormsModule,
    MatTabsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatDialogModule,
    MatProgressSpinnerModule,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
