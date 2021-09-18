import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: 'home', loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule) },
  { path: 'online-room/:uid', loadChildren: () => import('./pages/online-room/online-room.module').then( m => m.OnlineRoomPageModule) },
  { path: 'registry', loadChildren: () => import('./pages/registry/registry.module').then( m => m.RegistryPageModule) },
  { path: 'friend', loadChildren: () => import('./pages/friend/friend.module').then( m => m.FriendPageModule) },
  { path: 'personal-room/:code', loadChildren: () => import('./pages/personal-room/personal-room.module').then( m => m.PersonalRoomPageModule) },
  { path: 'notifications', loadChildren: () => import('./pages/notifications/notifications.module').then( m => m.NotificationsPageModule) },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
