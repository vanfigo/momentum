import { Component } from '@angular/core';
import { Action, DocumentChangeAction, DocumentSnapshot } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { LoadingController, NavController, ViewDidLeave, ViewWillEnter } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Lobby } from 'src/app/models/lobby.class';
import { MomentumUser } from 'src/app/models/momentum-user.class';
import { RoomType } from 'src/app/models/room-type.enum';
import { AuthService } from 'src/app/services/auth.service';
import { LobbyService } from 'src/app/services/lobby.service';
import { RoomService } from 'src/app/services/room.service';

@Component({
  selector: 'app-play',
  templateUrl: './play.page.html',
  styleUrls: ['./play.page.scss'],
})
export class PlayPage implements ViewDidLeave, ViewWillEnter {

  today = new Date();
  RoomType = RoomType;
  user: MomentumUser;
  loading: boolean;
  
  userSubscription: Subscription;

  rankedLobbiesSubscription: Subscription;
  rankedRoomsSubscription: Subscription;
  rankedLobbies: number;
  rankedRooms: number;

  unrankedRoomsSubscription: Subscription;
  unrankedRooms: number;

  constructor(private authSvc: AuthService,
              private lobbySvc: LobbyService,
              private roomSvc: RoomService,
              private navCtrl: NavController,
              private route: ActivatedRoute,
              private loadingCtrl: LoadingController) { }
              
  ionViewDidLeave(): void {
    this.userSubscription && this.userSubscription.unsubscribe();
    this.rankedLobbiesSubscription && this.rankedLobbiesSubscription.unsubscribe();
    this.rankedRoomsSubscription && this.rankedRoomsSubscription.unsubscribe();
    this.unrankedRoomsSubscription && this.unrankedRoomsSubscription.unsubscribe();
  }

  ionViewWillEnter = async (): Promise<void> => {
    this.loading = true;
    if (this.rankedLobbiesSubscription === undefined || this.rankedLobbiesSubscription.closed) {
      this.rankedLobbiesSubscription = this.lobbySvc.countLobbiesByRoomType(RoomType.RANKED).subscribe((changeActions: DocumentChangeAction<Lobby>[]) =>
        this.rankedLobbies = changeActions.reduce((prev, current) => current.type === "added" || "modified" ? prev + 1 : prev, 0));
    }
    if (this.rankedRoomsSubscription === undefined || this.rankedRoomsSubscription.closed) {
      this.roomSvc.countRoomsActiveByRoomType(RoomType.RANKED).subscribe((changeActions: DocumentChangeAction<Lobby>[]) => 
      this.rankedRooms = changeActions.reduce((prev, current) => current.type === "added" || "modified" ? prev + 1 : prev, 0));
    }
    if (this.unrankedRoomsSubscription === undefined || this.unrankedRoomsSubscription.closed) {
      this.roomSvc.countRoomsActiveByRoomType(RoomType.UNRANKED).subscribe((changeActions: DocumentChangeAction<Lobby>[]) => 
      this.unrankedRooms = changeActions.reduce((prev, current) => current.type === "added" || "modified" ? prev + 1 : prev, 0));
    }
    // listens for when the user access to a room
    if (this.userSubscription === undefined || this.userSubscription.closed) {
      this.userSubscription = this.authSvc.listenCurrentUserChanges().subscribe((action: Action<DocumentSnapshot<MomentumUser>>) => {
        this.user = action.payload.data();
        this.loading = false;
        if (action.type === 'modified' && ( this.user.rankedRoomUid || this.user.unrankedRoomUid)) {
          this.loadingCtrl.dismiss().then(() => {
            const roomType = this.user.rankedRoomUid ? RoomType.RANKED : RoomType.UNRANKED;
            const roomURL = roomType === RoomType.RANKED ? '/ranked-room' : '/unranked-room';
            this.navCtrl.navigateForward([roomURL, roomType === RoomType.RANKED ? this.user.rankedRoomUid : this.user.unrankedRoomUid], {relativeTo: this.route});
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
