import { Component, OnInit } from '@angular/core';
import { DocumentData, QueryDocumentSnapshot, QuerySnapshot } from '@angular/fire/firestore';
import { ActionSheetController, LoadingController, NavController } from '@ionic/angular';
import { FriendStatus } from 'src/app/models/friend-status.enum';
import { Friend } from 'src/app/models/friend.class';
import { NotificationType } from 'src/app/models/notification-type.enum';
import { Notification } from 'src/app/models/notification.class';
import { AuthService } from 'src/app/services/shared/auth.service';
import { FriendService } from 'src/app/services/friend.service';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { ActivatedRoute, Route } from '@angular/router';
import { AdService } from 'src/app/services/shared/ad.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
})
export class NotificationsPage implements OnInit {

  isLoading: boolean = true;
  notifications: Notification[] = []
  lastNotification: QueryDocumentSnapshot<Notification>;
  NotificationType = NotificationType;

  constructor(private notificationSvc: NotificationService,
              private loadingCtrl: LoadingController,
              private actionSheetCtrl: ActionSheetController,
              private friendSvc: FriendService,
              private authSvc: AuthService,
              private navCtrl: NavController,
              private route: ActivatedRoute,
              private adSvc: AdService) { }

  async ngOnInit() {
    const loading = await this.loadingCtrl.create({ message: 'Cargando...', spinner: 'dots', mode: 'ios' });
    await loading.present();
    this.loadNotifications();
  }

  loadNotifications = (event?: any) => {
    this.notificationSvc.getByUserToUid(this.lastNotification).then(async (snapshot: QuerySnapshot<Notification>) => {
      const newNotifications = snapshot.docs.map(doc => { return {...doc.data(), uid: doc.id} });
      this.notifications = this.notifications.concat(newNotifications);
      this.lastNotification = snapshot.docs[snapshot.docs.length - 1];
      const loading = await this.loadingCtrl.getTop();
      loading && await loading.dismiss();
      this.isLoading = false;
      if (event) {
        event.target.complete();
        if (newNotifications.length === 0) {
          event.target.disabled = true;
        }
      }
    });
  }

  showNotificationDetail = async (notification: Notification) => {
    if (!notification.solved) {
      if (!notification.read) {
        notification.read = true;
        this.notificationSvc.read(notification.uid);
      }
      switch(notification.type) {
        case NotificationType.FRIENDSHIP:
          this.actionSheetCtrl.create({
            header: notification.username,
            subHeader: notification.message,
            buttons: [{
              role: 'cancel',
              text: 'Cancelar',
              icon: 'close-circle'
            }, {
              text: 'Aceptar',
              icon: 'checkmark-circle',
              handler: () => this.processFriendshipNotification(notification, true)
            }, {
              cssClass: 'danger-button',
              text: 'Rechazar',
              icon: 'ban',
              handler: () => this.processFriendshipNotification(notification, false)
            }]
          }).then(actionSheet => actionSheet.present())
          break;
        case NotificationType.PERSONAL_ROOM:
          this.actionSheetCtrl.create({
            header: notification.username,
            subHeader: notification.message,
            buttons: [{
              role: 'cancel',
              text: 'Cancelar',
              icon: 'close-circle'
            }, {
              text: 'Unirse',
              icon: 'enter',
              handler: () => this.processPersonalRoomNotification(notification)
            }]
          }).then(actionSheet => actionSheet.present())
          break;
      }
    }
  }

  processFriendshipNotification = async (notification: Notification, accepted: boolean) => {
    notification.solved = true;
    const loading = await this.loadingCtrl.create({ message: 'Validando...', spinner: 'dots', mode: 'ios' });
    await loading.present();
    this.notificationSvc.solve(notification.uid).then(() => {
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
    })
  }

  processPersonalRoomNotification = async (notification: Notification) => {
    notification.solved = true;
    const loading = await this.loadingCtrl.create({ message: 'Uniendose...', spinner: 'dots', mode: 'ios' });
    await loading.present();
    this.notificationSvc.solve(notification.uid).then(() => {
      this.adSvc.showInterstitial(() => this.navCtrl.navigateForward(["/personal-room", notification.metadata.personalRoomCode], { relativeTo: this.route }));
    });
  }

  getIconName = (notificationType: NotificationType) => {
    switch (notificationType) {
      case NotificationType.FRIENDSHIP:
        return 'person-add';
      case NotificationType.PERSONAL_ROOM:
        return 'game-controller';
      default:
        return 'notifications';
    }
  }

}
