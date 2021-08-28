import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CreatePersonalRoomPageRoutingModule } from './create-personal-room-routing.module';

import { CreatePersonalRoomPage as CreatePersonalRoomPage } from './create-personal-room.page';
import { SharedModule } from 'src/app/components/shared/shared.module';
import { PipesModule } from 'src/app/pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    CreatePersonalRoomPageRoutingModule,
    PipesModule
  ],
  declarations: [CreatePersonalRoomPage]
})
export class CreatePersonalRoomPageModule {}
