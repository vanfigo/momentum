import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePage } from './home.page';

const routes: Routes = [
  { path: '', component: HomePage, children: [
    { path: 'profile', loadChildren: () => import('./profile/profile.module').then( m => m.DashboardPageModule) },
    { path: 'training-room', loadChildren: () => import('./training-room/training-room.module').then( m => m.TrainingRoomPageModule) },
    { path: 'play', loadChildren: () => import('./play/play.module').then( m => m.PlayPageModule) },
    { path: '**', redirectTo: 'profile', pathMatch: 'full' }
  ]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomePageRoutingModule {}
