import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PersonalRoomRecordsComponent } from './personal-room-records/personal-room-records.component';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from '../shared/shared.module';
import { PersonalRoomHistoryComponent } from './personal-room-history/personal-room-history.component';
import { PersonalRoomHistoryCardComponent } from './personal-room-history-card/personal-room-history-card.component';
import { PersonalRoomCreateComponent } from './personal-room-create/personal-room-create.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PipesModule } from 'src/app/pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    PipesModule
  ],
  declarations: [
    PersonalRoomRecordsComponent,
    PersonalRoomHistoryComponent,
    PersonalRoomHistoryCardComponent,
    PersonalRoomCreateComponent
  ],
  exports: [
    PersonalRoomRecordsComponent
  ]
})
export class PersonalRoomModule { }
