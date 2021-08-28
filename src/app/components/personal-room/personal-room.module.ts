import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PersonalRoomRecordsComponent } from './personal-room-records/personal-room-records.component';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    SharedModule
  ],
  declarations: [
    PersonalRoomRecordsComponent
  ],
  exports: [
    PersonalRoomRecordsComponent
  ]
})
export class PersonalRoomModule { }
