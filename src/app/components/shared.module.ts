import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from './header/header.component';
import { TimeChipComponent } from './time-chip/time-chip.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule
  ],
  declarations: [
    HeaderComponent
  ],
  exports: [
    HeaderComponent
  ]
})
export class SharedModule { }
