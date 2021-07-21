import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RoomPageRoutingModule } from './room-routing.module';

import { RoomPage } from './room.page';
import { RoomModule } from '../../components/room.module';
import { SharedModule } from 'src/app/components/shared.module';
import { HistoryComponent } from 'src/app/components/history/history.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RoomPageRoutingModule,
    RoomModule,
    SharedModule
  ],
  declarations: [RoomPage]
})
export class RoomPageModule {}
