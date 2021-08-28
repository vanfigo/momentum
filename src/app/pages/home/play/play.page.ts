import { Component } from '@angular/core';
import { Action, DocumentChangeAction, DocumentSnapshot, QuerySnapshot } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { LoadingController, ModalController, NavController, ViewDidLeave, ViewWillEnter } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Lobby } from 'src/app/models/lobby.class';
import { MomentumUser } from 'src/app/models/momentum-user.class';
import { PersonalRoom } from 'src/app/models/personal-room.class';
import { RoomType } from 'src/app/models/room-type.enum';
import { AuthService } from 'src/app/services/auth.service';
import { LobbyService } from 'src/app/services/lobby.service';
import { OnlineRoomService } from 'src/app/services/online-room.service';
import { PersonalRoomService } from 'src/app/services/personal-room.service';

@Component({
  selector: 'app-play',
  templateUrl: './play.page.html',
  styleUrls: ['./play.page.scss'],
})
export class PlayPage implements ViewDidLeave, ViewWillEnter {

  RoomType = RoomType;
  user: MomentumUser;
  userSnapshot: DocumentSnapshot<MomentumUser>;
  loading: boolean;
  loadingPublicRooms: boolean = true;
  publicRooms: PersonalRoom[];
  
  userSubscription: Subscription;

  rankedLobbiesSubscription: Subscription;
  rankedRoomsSubscription: Subscription;
  rankedLobbies: number;
  rankedRooms: number;

  unrankedRoomsSubscription: Subscription;
  unrankedRooms: number;

  constructor(private authSvc: AuthService,
              private lobbySvc: LobbyService,
              private onlineRoomSvc: OnlineRoomService,
              private navCtrl: NavController,
              private route: ActivatedRoute,
              private loadingCtrl: LoadingController,
              private modalCtrl: ModalController,
              private personalRoomSvc: PersonalRoomService) { }
              
  ionViewDidLeave(): void {
    this.rankedLobbiesSubscription && this.rankedLobbiesSubscription.unsubscribe();
    this.rankedRoomsSubscription && this.rankedRoomsSubscription.unsubscribe();
    this.unrankedRoomsSubscription && this.unrankedRoomsSubscription.unsubscribe();
  }

  ionViewWillEnter = async (): Promise<void> => {
    this.loading = true;
    this.authSvc.getUserFromDB().then((userSnapshot: DocumentSnapshot<MomentumUser>) => {
      this.user = {...userSnapshot.data(), uid: userSnapshot.id};
      this.userSnapshot = userSnapshot;
      this.loading = false;
    });
    this.personalRoomSvc.getByPrivate(false)
      .then((roomSnapshot: QuerySnapshot<PersonalRoom>) => {
        this.publicRooms = roomSnapshot.docs.map(doc => {
          return { ...doc.data(), uid: doc.id };
        });
        this.loadingPublicRooms = false;
      });
    if (this.rankedLobbiesSubscription === undefined || this.rankedLobbiesSubscription.closed) {
      this.rankedLobbiesSubscription = this.lobbySvc.countLobbiesByRoomType(RoomType.RANKED).subscribe((changeActions: DocumentChangeAction<Lobby>[]) =>
        this.rankedLobbies = changeActions.reduce((prev, current) => current.type === "added" || "modified" ? prev + 1 : prev, 0));
    }
    if (this.rankedRoomsSubscription === undefined || this.rankedRoomsSubscription.closed) {
      this.onlineRoomSvc.countRoomsActiveByRoomType(RoomType.RANKED).subscribe((changeActions: DocumentChangeAction<Lobby>[]) => 
      this.rankedRooms = changeActions.reduce((prev, current) => current.type === "added" || "modified" ? prev + 1 : prev, 0));
    }
    if (this.unrankedRoomsSubscription === undefined || this.unrankedRoomsSubscription.closed) {
      this.onlineRoomSvc.countRoomsActiveByRoomType(RoomType.UNRANKED).subscribe((changeActions: DocumentChangeAction<Lobby>[]) => 
      this.unrankedRooms = changeActions.reduce((prev, current) => current.type === "added" || "modified" ? prev + 1 : prev, 0));
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
      // listens for when the user access to a room
      if (this.userSubscription === undefined || this.userSubscription.closed) {
        this.userSubscription = this.authSvc.listenCurrentUserChanges().subscribe((action: Action<DocumentSnapshot<MomentumUser>>) => {
          const user = action.payload.data();
          if (action.type === 'modified' && ( user.rankedRoomUid || user.unrankedRoomUid)) {
            const roomType = user.rankedRoomUid ? RoomType.RANKED : RoomType.UNRANKED;
            const uri = roomType === RoomType.RANKED ? user.rankedRoomUid : user.unrankedRoomUid
            this.loadingCtrl.dismiss().then(() => this.navCtrl.navigateForward(["/online-room", uri], {relativeTo: this.route}));
          }
        });
      }
      // deletes the actual room reference for the room type sent
      this.userSnapshot.ref.update({rankedRoomUid: null, unrankedRoomUid: null}).then(() => 
        // adds the user as a player waiting in lobby
        this.lobbySvc.addPLayer(this.user, roomType).catch(() => console.error('error adding user to lobby'))
      ).catch(() => console.error('error updating user room uid'));

      loading.onDidDismiss().then((data) => {
        this.userSubscription && this.userSubscription.unsubscribe();
        if (data.role) {
          this.lobbySvc.removePlayer();
        }
      })
    });
  }

  showCreatePersonalRoom = () => this.navCtrl.navigateForward(["/personal-room"], {relativeTo: this.route});

  showPersonalRoom = (uid: string) => this.navCtrl.navigateForward(["/personal-room", uid], {relativeTo: this.route});

}
