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
import { FooterComponent } from "./components/footer/footer.component";
import { ProductButtonsComponent } from './components/product-buttons/product-buttons.component';
import { MatDialogModule } from '@angular/material/dialog';
import { DialogComponent } from './components/dialog/dialog.component';
import { LoadingOverlayComponent } from './components/loading-overlay/loading-overlay.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthComponent } from './components/auth/auth.component';
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
    FooterComponent,
    CartComponent,
    DialogComponent,
    LoadingOverlayComponent,
    AuthComponent,
  ],
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
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
