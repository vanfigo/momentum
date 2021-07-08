import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePage } from './home.page';

const routes: Routes = [
  { path: '', component: HomePage, children: [
    { path: 'dashboard', loadChildren: () => import('../dashboard/dashboard.module').then( m => m.DashboardPageModule) },
    { path: 'room', loadChildren: () => import('../room/room.module').then( m => m.RoomPageModule) },
    { path: 'play', loadChildren: () => import('../play/play.module').then( m => m.PlayPageModule) },
    { path: '**', redirectTo: 'dashboard', pathMatch: 'full' }
  ]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomePageRoutingModule {}
