import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OnlineRoomPage } from './online-room.page';

const routes: Routes = [ { path: '', component: OnlineRoomPage } ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OnlineRoomPageRoutingModule {}
