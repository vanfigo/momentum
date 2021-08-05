import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { PlayingRoomHistoryComponent } from './playing-room-history/playing-room-history.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    SharedModule
  ],
  declarations: [PlayingRoomHistoryComponent],
  exports: [PlayingRoomHistoryComponent]
})
export class PlayingRoomModule { }
