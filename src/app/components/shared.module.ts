import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from './header/header.component';
import { RecordChipComponent } from './record-chip/record-chip.component';

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
