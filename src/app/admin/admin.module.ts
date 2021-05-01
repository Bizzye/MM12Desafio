import { FilterPipe } from './../pipes/filter.pipe';
import { NavModule } from './../shared/nav/nav.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AdminPageRoutingModule } from './admin-routing.module';

import { AdminPage } from './admin.page';
import { MenuPageModule } from '../menu/menu.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AdminPageRoutingModule,
    NavModule,
    MenuPageModule
  ],
  declarations: [AdminPage,FilterPipe]
})
export class AdminPageModule {}
