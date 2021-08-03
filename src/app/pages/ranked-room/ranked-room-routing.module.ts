import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RankedRoomPage } from './ranked-room.page';

const routes: Routes = [ { path: '', component: RankedRoomPage } ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RankedRoomPageRoutingModule {}
