import { NgModule } from '@angular/core';
import { BrowserModule, HammerModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { environment } from 'src/environments/environment';
import { LoginPageModule } from './pages/login/login.module';
import { USE_EMULATOR as USE_AUTH_EMULATOR } from '@angular/fire/auth';
import { USE_EMULATOR as USE_FIRESTORE_EMULATOR } from '@angular/fire/firestore';
import { USE_EMULATOR as USE_FUNCTIONS_EMULATOR } from '@angular/fire/functions';

@NgModule({
  imports: [
    BrowserModule,
    HammerModule,
    IonicModule.forRoot(),
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAuthModule,
    AngularFirestoreModule,
    AppRoutingModule,
    LoginPageModule
  ],
  declarations: [AppComponent],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: USE_AUTH_EMULATOR, useValue: environment.firebaseConfig.useEmulators ? ['localhost', 9099] : undefined },
    { provide: USE_FIRESTORE_EMULATOR, useValue: environment.firebaseConfig.useEmulators ? ['localhost', 8080] : undefined },
    { provide: USE_FUNCTIONS_EMULATOR, useValue: environment.firebaseConfig.useEmulators ? ['localhost', 5001] : undefined }],
  bootstrap: [AppComponent],
})
export class AppModule {}
