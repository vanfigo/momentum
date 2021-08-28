import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PersonalRoomPage } from './personal-room.page';

const routes: Routes = [
  {
    path: '',
    component: PersonalRoomPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PersonalRoomPageRoutingModule {}
