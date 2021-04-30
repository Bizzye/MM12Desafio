import { HomePageRoutingModule } from './../home/home-routing.module';
import { ProductPageRoutingModule } from './../product/product-routing.module';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MenuPage } from './menu.page';

const routes: Routes = [
  {
    path: '',
    component: MenuPage
  },
  {
    path: 'product',
    component: ProductPageRoutingModule
  },
  {
    path: 'home',
    component: HomePageRoutingModule
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MenuPageRoutingModule {}
