import { NavComponent } from './nav.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';



@NgModule({
  declarations: [NavComponent],
  exports: [NavComponent],
  imports: [
    CommonModule
  ]
})
export class NavModule { }
