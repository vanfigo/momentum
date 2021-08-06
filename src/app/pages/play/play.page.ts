import { Component } from '@angular/core';
import { Action, DocumentSnapshot } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { LoadingController, NavController, ViewDidLeave, ViewWillEnter } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { MomentumUser } from 'src/app/models/momentum-user.class';
import { RoomType } from 'src/app/models/room-type.enum';
import { AuthService } from 'src/app/services/auth.service';
import { LobbyService } from 'src/app/services/lobby.service';

@Component({
  selector: 'app-play',
  templateUrl: './play.page.html',
  styleUrls: ['./play.page.scss'],
})
export class PlayPage implements ViewDidLeave, ViewWillEnter {

  today = new Date();
  RoomType = RoomType;
  userSubscription: Subscription;

  constructor(private authSvc: AuthService,
              private lobbySvc: LobbyService,
              private navCtrl: NavController,
              private route: ActivatedRoute,
              private loadingCtrl: LoadingController) { }
              
  ionViewDidLeave(): void {
    this.userSubscription && this.userSubscription.unsubscribe();
  }

  ionViewWillEnter(): void {
    // listens for when the user access to a room
    if (this.userSubscription === undefined || this.userSubscription.closed) {
      this.userSubscription = this.authSvc.listenCurrentUserChanges().subscribe((action: Action<DocumentSnapshot<MomentumUser>>) => {
        const user: MomentumUser = action.payload.data();
        if (action.type === 'modified' && ( user.rankedRoomUid || user.unrankedRoomUid)) {
          this.loadingCtrl.dismiss().then(() => {
            const roomType = user.rankedRoomUid ? RoomType.RANKED : RoomType.UNRANKED;
            const roomURL = roomType === RoomType.RANKED ? '/ranked-room' : '/unranked-room';
            this.navCtrl.navigateForward([roomURL, roomType === RoomType.RANKED ? user.rankedRoomUid : user.unrankedRoomUid], {relativeTo: this.route});
          });
        }
      });
    }
  }

  addWaitingPlayer = (roomType: RoomType) => {
    this.loadingCtrl.create({
      message: 'Buscando jugadores...',
      backdropDismiss: true,
      spinner: 'dots'
    })
    .then(loading => {
      loading.present();
      this.authSvc.getUserFromDB()
      .then((userSnapshot: DocumentSnapshot<MomentumUser>) => {
        // deletes the actual room reference for the room type sent
        userSnapshot.ref.update({rankedRoomUid: null, unrankedRoomUid: null})
          .then(() => {
            let user: MomentumUser = {...userSnapshot.data(), uid: userSnapshot.id};
            // adds the user as a player waiting in lobby
            this.lobbySvc.addPLayer(user, roomType)
            .catch(() => console.error('error adding user to lobby'));
          })
          .catch(() => console.error('error updating user room uid'));
      })
      .catch(() => console.error('error retrieving user from DB'));
    });
  }

}
