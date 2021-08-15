import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: 'home', loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule) },
  { path: 'online-room/:uid', loadChildren: () => import('./pages/online-room/online-room.module').then( m => m.OnlineRoomPageModule) },
  { path: 'registry', loadChildren: () => import('./pages/home/profile/registry/registry.module').then( m => m.RegistryPageModule) },
  { path: 'friend', loadChildren: () => import('./pages/home/profile/friend/friend.module').then( m => m.FriendPageModule) },
  { path: '', redirectTo: 'home', pathMatch: 'full' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
