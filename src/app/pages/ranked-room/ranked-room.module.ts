import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RankedRoomPageRoutingModule } from './ranked-room-routing.module';

import { RankedRoomPage } from './ranked-room.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RankedRoomPageRoutingModule
  ],
  declarations: [RankedRoomPage]
})
export class RankedRoomPageModule {}
