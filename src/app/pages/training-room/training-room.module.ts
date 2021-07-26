import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TrainingRoomPageRoutingModule } from './training-room-routing.module';

import { TrainingRoomPage } from './training-room.page';
import { TrainingRoomModule } from '../../components/training-room/training-room.module';
import { SharedModule } from 'src/app/components/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TrainingRoomPageRoutingModule,
    SharedModule,
    TrainingRoomModule
  ],
  declarations: [TrainingRoomPage]
})
export class TrainingRoomPageModule {}
