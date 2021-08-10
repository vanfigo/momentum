import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OnlineRoomPageRoutingModule } from './online-room-routing.module';

import { OnlineRoomPage } from './online-room.page';
import { SharedModule } from 'src/app/components/shared/shared.module';
import { OnlineRoomModule } from 'src/app/components/online-room/online-room.module';
import { PipesModule } from 'src/app/pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OnlineRoomPageRoutingModule,
    SharedModule,
    OnlineRoomModule,
    PipesModule
  ],
  declarations: [OnlineRoomPage]
})
export class OnlineRoomPageModule {}
