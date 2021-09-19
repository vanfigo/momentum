import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PlayPageRoutingModule } from './play-routing.module';

import { PlayPage } from './play.page';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { SharedModule } from 'src/app/components/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PlayPageRoutingModule,
    PipesModule,
    SharedModule
  ],
  declarations: [PlayPage],
  providers: [DatePipe]
})
export class PlayPageModule {}
