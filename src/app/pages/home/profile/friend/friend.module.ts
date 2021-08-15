import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FriendPageRoutingModule } from './friend-routing.module';

import { FriendPage } from './friend.page';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { SharedModule } from 'src/app/components/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FriendPageRoutingModule,
    PipesModule,
    SharedModule
  ],
  declarations: [FriendPage]
})
export class FriendPageModule {}
