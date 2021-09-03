import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';
import { AdMob } from '@capacitor-community/admob';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  loading = true;

  constructor(private authService: AuthService) {
    this.authService.$userRetrieved.subscribe(() => this.loading = false);
    AdMob.initialize({
      initializeForTesting: true // !environment.production
    });
  }
}
