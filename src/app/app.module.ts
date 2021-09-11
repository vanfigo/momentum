import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule, HammerModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuth, AngularFireAuthModule, USE_EMULATOR as USE_AUTH_EMULATOR } from '@angular/fire/auth';
import { AngularFirestoreModule, USE_EMULATOR as USE_FIRESTORE_EMULATOR } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFireFunctionsModule, USE_EMULATOR as USE_FUNCTIONS_EMULATOR } from '@angular/fire/functions';
import { environment } from 'src/environments/environment';
import { LoginPageModule } from './pages/login/login.module';
import { SharedModule } from './components/shared/shared.module';

export function initializeApp(afAuth: AngularFireAuth): () => Promise<void> {
  return () => {
    return new Promise((resolve) => {
      if (!environment.firebaseConfig.useEmulators) {
        return resolve();
      } else {
        afAuth.useEmulator(`http://${location.hostname}:9099/`).then(() => {
          resolve();
        });
      }
    });
  };
}

@NgModule({
  imports: [
    BrowserModule,
    HammerModule,
    IonicModule.forRoot(),
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAuthModule,
    AngularFirestoreModule,
    AngularFireFunctionsModule,
    AngularFireStorageModule,
    AppRoutingModule,
    LoginPageModule,
    SharedModule
  ],
  declarations: [AppComponent],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: APP_INITIALIZER, multi: true, deps: [AngularFireAuth], useFactory: initializeApp },
    { provide: USE_AUTH_EMULATOR, useValue: environment.firebaseConfig.useEmulators ? ['localhost', 9099] : undefined },
    { provide: USE_FIRESTORE_EMULATOR, useValue: environment.firebaseConfig.useEmulators ? ['localhost', 8080] : undefined },
    { provide: USE_FUNCTIONS_EMULATOR, useValue: environment.firebaseConfig.useEmulators ? ['localhost', 5001] : undefined }],
  bootstrap: [AppComponent],
})
export class AppModule {}
