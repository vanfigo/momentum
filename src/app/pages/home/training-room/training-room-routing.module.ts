import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TrainingRoomPage } from './training-room.page';

const routes: Routes = [{ path: '', component: TrainingRoomPage }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TrainingRoomPageRoutingModule {}
