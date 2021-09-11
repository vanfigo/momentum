import { Component, OnInit } from '@angular/core';
import { QueryDocumentSnapshot } from '@angular/fire/firestore';
import { LoadingController } from '@ionic/angular';
import { FriendStatus } from 'src/app/models/friend-status.enum';
import { Friend } from 'src/app/models/friend.class';
import { NotificationType } from 'src/app/models/notification-type.enum';
import { Notification } from 'src/app/models/notification.class';
import { AuthService } from 'src/app/services/shared/auth.service';
import { FriendService } from 'src/app/services/friend.service';
import { NotificationService } from 'src/app/services/shared/notification.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
})
export class NotificationsPage implements OnInit {

  loading: boolean = true;
  notifications: Notification[] = []
  lastNotification: QueryDocumentSnapshot<Notification>;
  NotificationType = NotificationType;

  constructor(private notificationSvc: NotificationService,
              private loadingCtrl: LoadingController,
              private friendSvc: FriendService,
              private authSvc: AuthService) {
    this.loadNotifications();
  }

  ngOnInit() {
  }

  loadNotifications = (event?: any) => {
    this.notificationSvc.getByUserToUid().then(snapshot => {
      const newNotifications = snapshot.docs.map(doc => { return {...doc.data(), uid: doc.id} });
      this.notifications = this.notifications.concat(newNotifications);
      this.lastNotification = snapshot.docs[snapshot.docs.length - 1];
      this.loading = false;
      if (event) {
        event.target.complete();
        if (newNotifications.length === 0) {
          event.target.disabled = true;
        }
      }
    });
  }

  readNotification = (notification: Notification, accepted: boolean) => {
    notification.read = true;
    this.loadingCtrl.create({
      message: 'Cargando...',
      spinner: 'dots'
    }).then(loading => {
      loading.present();
      this.notificationSvc.read(notification.uid)
        .then(() => {
          switch (notification.notificationType) {
            case NotificationType.FRIENDSHIP:
              const friend: Friend = {
                userUid: notification.userToUid,
                friendUid: notification.userFromUid,
                userUsername: this.authSvc.user.username,
                username: notification.username,
                userEmail: this.authSvc.user.email,
                email: notification.email,
                userPhotoURL: this.authSvc.user.photoURL,
                photoURL: notification.photoURL,
                status: FriendStatus.ACCEPTED,
                creation: new Date().getTime(),
              }
              if (accepted) {
                this.friendSvc.sendFriendRequest(friend).then(() => loading.dismiss());
              } else {
                this.friendSvc.deleteFriendRequest(friend).then(() => loading.dismiss());
              }
              break;
            case NotificationType.PERSONAL_ROOM:
              break;
          }
        })
    });
  }

}
