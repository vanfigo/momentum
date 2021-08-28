import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PersonalRoomRecordsComponent } from './personal-room-records/personal-room-records.component';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from '../shared/shared.module';
import { PersonalRoomHistoryComponent } from './personal-room-history/personal-room-history.component';
import { PersonalRoomHistoryCardComponent } from './personal-room-history-card/personal-room-history-card.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    SharedModule
  ],
  declarations: [
    PersonalRoomRecordsComponent,
    PersonalRoomHistoryComponent,
    PersonalRoomHistoryCardComponent
  ],
  exports: [
    PersonalRoomRecordsComponent
  ]
})
export class PersonalRoomModule { }
