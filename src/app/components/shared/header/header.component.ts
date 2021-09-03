import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {

  constructor(private authService: AuthService,
              private navCtrl: NavController,
              private route: ActivatedRoute) {}

  signOut = () => this.authService.signOut();

  showNotifications = () => this.navCtrl.navigateForward(["/notifications"], { relativeTo: this.route });

}
