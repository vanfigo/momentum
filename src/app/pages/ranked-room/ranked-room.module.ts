import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RankedRoomPageRoutingModule } from './ranked-room-routing.module';

import { RankedRoomPage } from './ranked-room.page';
import { SharedModule } from 'src/app/components/shared/shared.module';
import { PlayingRoomModule } from 'src/app/components/playing-room/playing-room.module';
import { PipesModule } from 'src/app/pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RankedRoomPageRoutingModule,
    SharedModule,
    PlayingRoomModule,
    PipesModule
  ],
  declarations: [RankedRoomPage]
})
export class RankedRoomPageModule {}
