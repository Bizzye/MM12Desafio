import { MenuPageModule } from './../menu/menu.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProductPageRoutingModule } from './product-routing.module';

import { ProductPage } from './product.page';
import { NavModule } from './../shared/nav/nav.module';
import { FilterPipe } from './../pipes/filter.pipe';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProductPageRoutingModule,
    NavModule,
    MenuPageModule
  ],
  declarations: [ProductPage,FilterPipe]
})
export class ProductPageModule {}
