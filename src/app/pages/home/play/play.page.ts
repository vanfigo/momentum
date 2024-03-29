import { Component } from '@angular/core';
import { Action, DocumentChangeAction, DocumentSnapshot, QuerySnapshot } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { AlertController, LoadingController, ModalController, NavController, ToastController, ViewDidLeave, ViewWillEnter } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Lobby } from 'src/app/models/lobby.class';
import { MomentumUser } from 'src/app/models/momentum-user.class';
import { PersonalRoom } from 'src/app/models/personal-room.class';
import { RoomType } from 'src/app/models/room-type.enum';
import { AdService } from 'src/app/services/shared/ad.service';
import { AuthService } from 'src/app/services/shared/auth.service';
import { LobbyService } from 'src/app/services/playable-rooms/lobby.service';
import { OnlineRoomService } from 'src/app/services/playable-rooms/online-room.service';
import { PersonalRoomService } from 'src/app/services/playable-rooms/personal-room.service';
import { PersonalRoomCreateComponent } from '../../../components/personal-room/personal-room-create/personal-room-create.component';

@Component({
  selector: 'app-play',
  templateUrl: './play.page.html',
  styleUrls: ['./play.page.scss'],
})
export class PlayPage implements ViewDidLeave, ViewWillEnter {

  user: MomentumUser;
  RoomType = RoomType;
  loadingPublicRooms: boolean = true;
  publicRooms: PersonalRoom[];
  
  userSubscription: Subscription;

  rankedLobbies: number;
  rankedRooms: number;
  unrankedRooms: number;

  subscriptions: Subscription[] = [];

  constructor(public authSvc: AuthService,
              private lobbySvc: LobbyService,
              private onlineRoomSvc: OnlineRoomService,
              private personalRoomSvc: PersonalRoomService,
              private route: ActivatedRoute,
              private navCtrl: NavController,
              private loadingCtrl: LoadingController,
              private modalCtrl: ModalController,
              private alertCtrl: AlertController,
              private toastCtrl: ToastController,
              private adSvc: AdService) { }
              
  ionViewDidLeave(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    this.subscriptions = [];
  }

  ionViewWillEnter = async (): Promise<void> => {
    this.publicRooms = [];
    this.authSvc.getUserFromDB().then(user => this.user = user.data());
      this.subscriptions.push(this.personalRoomSvc.getByPrivate(false).subscribe((actions: DocumentChangeAction<PersonalRoom>[]) => {
        actions.forEach((action: DocumentChangeAction<PersonalRoom>) => {
          if (action.type === 'added') {
            this.publicRooms.push(action.payload.doc.data());
          }
        })
        if (actions.length < this.publicRooms.length) {
          this.publicRooms = this.publicRooms.filter(room => actions.find(action => action.payload.doc.data().code === room.code));
        }
        this.loadingPublicRooms = false;
      }));
    this.subscriptions.push(this.lobbySvc.countLobbiesByRoomType(RoomType.RANKED).subscribe((changeActions: DocumentChangeAction<Lobby>[]) =>
      this.rankedLobbies = changeActions.reduce((prev, current) => current.type === "added" || "modified" ? prev + 1 : prev, 0)));
    this.subscriptions.push(this.onlineRoomSvc.countRoomsActiveByRoomType(RoomType.RANKED).subscribe((changeActions: DocumentChangeAction<Lobby>[]) => 
      this.rankedRooms = changeActions.reduce((prev, current) => current.type === "added" || "modified" ? prev + 1 : prev, 0)));
    this.subscriptions.push(this.onlineRoomSvc.countRoomsActiveByRoomType(RoomType.UNRANKED).subscribe((changeActions: DocumentChangeAction<Lobby>[]) => 
      this.unrankedRooms = changeActions.reduce((prev, current) => current.type === "added" || "modified" ? prev + 1 : prev, 0)));
  }

  addWaitingPlayer = async (roomType: RoomType) => {
    const loading = await this.loadingCtrl.create({ message: 'Buscando jugadores...', spinner: 'dots', mode: 'ios', backdropDismiss: true });
    await loading.present();
    // listens for when the user access to a room
    if (this.userSubscription === undefined || this.userSubscription.closed) {
      this.subscriptions.push(this.authSvc.listenCurrentUserChanges().subscribe((action: Action<DocumentSnapshot<MomentumUser>>) => {
        const user = action.payload.data();
        if (action.type === 'modified' && ( user.rankedRoomUid || user.unrankedRoomUid)) {
          const roomType = user.rankedRoomUid ? RoomType.RANKED : RoomType.UNRANKED;
          const uri = roomType === RoomType.RANKED ? user.rankedRoomUid : user.unrankedRoomUid
          this.navCtrl.navigateForward(["/online-room", uri], {relativeTo: this.route});
        }
      }));
    }
    // deletes the actual room reference for the room type sent
    this.authSvc.update({rankedRoomUid: null, unrankedRoomUid: null}, false).then(() => 
      // adds the user as a player waiting in lobby
      this.lobbySvc.addPLayer(this.authSvc.user, roomType).catch(() => console.error('error adding user to lobby'))
    ).catch(() => console.error('error updating user room uid'));

    loading.onDidDismiss().then((data) => {
      this.userSubscription && this.userSubscription.unsubscribe();
      if (data.role) {
        this.lobbySvc.removePlayer();
      }
    })
  }

  showEnterPersonalRoom = () => {
    this.alertCtrl.create({
      header: "Ingresa el codigo",
      subHeader: "Pide a tus amigos que te compartan su codigo de sala",
      message: "En caso de ser sala privada, debes estar invitado, de lo contrario, no podras entrar",
      inputs: [{
        type: "number",
        name: "code",
        label: "Codigo"
      }],
      buttons: [{
        text: 'Cancelar',
        role: 'cancel'
      }, {
        text: 'Entrar',
        handler: async (data) => {
          let { code } = data;
          if (isNaN(code)) {
            this.toastCtrl.create({message: "El codigo de sala es incorrecto", color: "danger", buttons: ["cerrar"], duration: 3000})
              .then(toast => toast.present());
          } else {
            this.showPersonalRoom(code);
          }
        }
      }]
    }).then(alert => alert.present())
  }

  showCreatePersonalRoom = () => {
    this.modalCtrl.create({
      component: PersonalRoomCreateComponent
    }).then(modal => modal.present());
  }

  showPersonalRoom = async (code: string) => {
    const loading = await this.loadingCtrl.create({ message: 'Uniendose...', spinner: 'dots', mode: 'ios' });
    await loading.present();
    this.adSvc.showInterstitial(() => this.navCtrl.navigateForward(["/personal-room", code], {relativeTo: this.route}));
  }

}
