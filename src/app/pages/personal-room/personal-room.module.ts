import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PersonalRoomPageRoutingModule } from './personal-room-routing.module';

import { PersonalRoomPage } from './personal-room.page';
import { SharedModule } from 'src/app/components/shared/shared.module';
import { PersonalRoomModule } from 'src/app/components/personal-room/personal-room.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    PersonalRoomPageRoutingModule,
    PersonalRoomModule
  ],
  declarations: [PersonalRoomPage]
})
export class PersonalRoomPageModule {}
