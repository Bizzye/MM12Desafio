import { FilterPipe } from './../pipes/filter.pipe';
import { NavModule } from './../shared/nav/nav.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HistoryPageRoutingModule } from './history-routing.module';

import { HistoryPage } from './history.page';
import { MenuPageModule } from '../menu/menu.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HistoryPageRoutingModule,
    NavModule,
    MenuPageModule
  ],
  declarations: [HistoryPage,FilterPipe]
})
export class HistoryPageModule {}
