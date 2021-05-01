import { AdminPageRoutingModule } from './../admin/admin-routing.module';
import { HistoryPageRoutingModule } from './../history/history-routing.module';
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
  },
  {
    path: 'history',
    component: HistoryPageRoutingModule
  },
  {
    path: 'admin',
    component: AdminPageRoutingModule
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MenuPageRoutingModule {}
