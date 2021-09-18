import { Component, OnInit } from '@angular/core';
import { DocumentChangeAction } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { NavController, ToastController } from '@ionic/angular';
import { Notification } from 'src/app/models/notification.class';
import { AuthService } from 'src/app/services/shared/auth.service';
import { NotificationService } from 'src/app/services/shared/notification.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {

  notificationsCount: number = 0;

  constructor(private authSvc: AuthService,
              private navCtrl: NavController,
              private route: ActivatedRoute,
              private notificationSvc: NotificationService) {
    this.notificationSvc.listenToNotifications().subscribe((notifications: Notification[]) => {
      this.notificationsCount = notifications.length;
    })
  }

  signOut = () => this.authSvc.signOut();

  showNotifications = () => this.navCtrl.navigateForward(["/notifications"], { relativeTo: this.route });

}
