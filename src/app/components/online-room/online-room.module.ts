import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { OnlineRoomHistoryComponent } from './online-room-history/online-room-history.component';
import { SharedModule } from '../shared/shared.module';
import { PipesModule } from 'src/app/pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    SharedModule,
    PipesModule
  ],
  declarations: [OnlineRoomHistoryComponent],
  exports: [OnlineRoomHistoryComponent]
})
export class OnlineRoomModule { }
