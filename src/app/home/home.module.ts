import { MenuPageModule } from './../menu/menu.module';
import { NavModule } from './../shared/nav/nav.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';

import { HomePageRoutingModule } from './home-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    NavModule,
    MenuPageModule
  ],
  declarations: [HomePage]
})
export class HomePageModule {}
