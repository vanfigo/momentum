import { Route } from '@angular/compiler/src/core';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Action, DocumentData, DocumentSnapshot, QuerySnapshot } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { AlertController, LoadingController, NavController, ViewDidEnter } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { PersonalRoomRecordsComponent } from 'src/app/components/personal-room/personal-room-records/personal-room-records.component';
import { ScramblerComponent } from 'src/app/components/shared/scrambler/scrambler.component';
import { MomentumUser } from 'src/app/models/momentum-user.class';
import { PersonalRecord } from 'src/app/models/personal-record.class';
import { PersonalRoom } from 'src/app/models/personal-room.class';
import { Player } from 'src/app/models/player.class';
import { Record } from 'src/app/models/record.class';
import { AuthService } from 'src/app/services/shared/auth.service';
import { PersonalRoomService } from 'src/app/services/playable-rooms/personal-room.service';

@Component({
  selector: 'app-personal-room',
  templateUrl: './personal-room.page.html',
  styleUrls: ['./personal-room.page.scss'],
})
export class PersonalRoomPage implements ViewDidEnter, OnDestroy {

  personalRoom: PersonalRoom;
  isRoomDeleted: boolean = false;
  player: Player;
  personalRecord: PersonalRecord = null;
  listenToUpdates: boolean = true;
  loading: boolean = true;
  personalRoomSubscription: Subscription;
  @ViewChild(ScramblerComponent, {static: false}) scramblerCmpt: ScramblerComponent;
  @ViewChild(PersonalRoomRecordsComponent, {static: false}) recordsCmpt: PersonalRoomRecordsComponent;

  constructor(private route: ActivatedRoute,
              private authSvc: AuthService,
              private personalRoomSvc: PersonalRoomService,
              private alertCtrl: AlertController,
              private navCtrl: NavController,
              private loadingCtrl: LoadingController) { }

  ionViewDidEnter() {
    // get personal-room info
    this.personalRoomSvc.getByCode(this.route.snapshot.params['code'])
      .then(async (snapshot) => {
        if (snapshot.exists) {
          this.personalRoom = {...snapshot.data()};
          // get players added (isPriavte ? friends added : people accessed this public room)
          const playersSnapshot = await this.personalRoomSvc.getPlayers(this.personalRoom.code);
          const playerFound = playersSnapshot.docs.find(snapshot => snapshot.data().uid === this.authSvc.user.uid)
          if (this.personalRoom.isPrivate) {
            this.hideLoadingMessage()
            if (playerFound !== undefined) {
              await this.personalRoomSvc.setActive(this.personalRoom.code, true);
              this.player = {...playerFound.data() as Player, active: true};
            } else {
              this.alertCtrl.create({
                header: "Oops :(",
                subHeader: "No estas en la lista",
                message: "Para acceder a esta sala privada debes de estar en la lista de jugadores invitados",
                buttons: [{
                  text: "Aceptar",
                  role: "cancel",
                  handler: () => this.navCtrl.navigateBack(["/home"], {relativeTo: this.route})
                }]
              }).then(alert => alert.present());
            }
          } else { // public room
            if (playerFound === undefined) { // not in players list
              const { uid, username, email, photoURL } = this.authSvc.user;
              this.player = { uid, username, email, photoURL, active: true }
              await this.personalRoomSvc.addPlayer(this.personalRoom.code, this.player);
              this.hideLoadingMessage()
            } else { // player already in public personal-room
              // This piece of code should never be called, but is better to have it, since a public player will be pop from players list once it exits
              await this.personalRoomSvc.setActive(this.personalRoom.code, true);
              this.hideLoadingMessage()
              this.player = {...playerFound.data() as Player, active: true};
            }
          }
          this.personalRoomSubscription && this.personalRoomSubscription.unsubscribe();
          this.personalRoomSubscription = this.personalRoomSvc.listenToPersonalRoom(this.personalRoom.code).subscribe((action: Action<DocumentSnapshot<PersonalRoom>>) => {
            switch(action.type) {
              case 'added':
              case 'modified':
                const { currentPersonalSolveUid } = action.payload.data();
                currentPersonalSolveUid && this.listenToSolves(currentPersonalSolveUid)
                break;
              case 'removed':
                this.isRoomDeleted = true;
                this.showNonExistantRoom(true);
                break;
            }
            this.loading = false;
            this.personalRoomSvc.getHistoryCount(this.personalRoom.code).then((snapshot: QuerySnapshot<PersonalRecord>) =>
              this.recordsCmpt.setPersonalSolveCount(snapshot.docs.length));
          });
          window.addEventListener('beforeunload', this.exitPersonalRoom);
        } else {
          this.hideLoadingMessage();
          this.showNonExistantRoom(false);
        }
      });
  }

  hideLoadingMessage = async () => {
    const loading = await this.loadingCtrl.getTop();
    loading && await loading.dismiss();
  }

  showNonExistantRoom = (deleted: boolean = false) => this.alertCtrl.create({
    header: "Oops :(",
    subHeader: deleted ? "El host abandono la sala" : "Esta sala ya no existe",
    message: deleted ? "La sala en la que estabas jugando dejo de existir, intenta crear o unirte a una nueva"
      : "La sala a la que intentas entrar dejo de existir, intenta con un nuevo codigo",
    buttons: [{
      text: "Cerrar",
      role: "cancel",
      handler: () => this.navCtrl.navigateBack(["/home"], {relativeTo: this.route})
    }]
  }).then(alert => alert.present());

  ngOnDestroy() {
    this.personalRoomSubscription && this.personalRoomSubscription.unsubscribe();
    this.exitPersonalRoom()
  }

  exitPersonalRoom = () => {
    if (this.personalRoom && !this.isRoomDeleted) {
      if (this.isHost()) {
        const deleteSubscription = this.personalRoomSvc.deletePersonalRoomByCode(
          this.personalRoom.code).subscribe(() => deleteSubscription.unsubscribe());
      } else {
        if (this.personalRoom.isPrivate) {
          this.personalRoomSvc.setActive(this.personalRoom.code, false);
        } else {
          this.personalRoomSvc.removePlayer(this.personalRoom.code);
        }
      }
    }
  }

  isHost = () => this.personalRoom && this.authSvc.user.uid === this.personalRoom.hostUid;

  updateScramble = () => {
    this.scramblerCmpt.updateScramble();
  }

  updateCurrentScramble = (scramble: string ) => {
    if (this.isHost()) {
      this.personalRoomSvc.updateCurrentScramble(this.personalRoom.code, scramble);
      if (this.personalRecord) {
        this.personalRoomSvc.addHistory(this.personalRoom.code, this.personalRecord)
          .then(() => this.recordsCmpt.incrementSolveCount());
      }
    }
  }

  listenToSolves = (personalSolveUid: string) => {
    if (this.personalRecord !== null) {
      if (!this.isHost()) {
        this.personalRoomSvc.addHistory(this.personalRoom.code, this.personalRecord)
          .then(() => this.recordsCmpt.incrementSolveCount());
      }
    }
    this.personalRoomSvc.getCurrentScramble(this.personalRoom.code, personalSolveUid).toPromise().then((document: DocumentSnapshot<any>) => {
      const {scramble} = document.data();
      this.scramblerCmpt.setScramble(scramble);
      this.recordsCmpt.setPersonalSolveUid(personalSolveUid);
      this.personalRecord = null;
      this.listenToUpdates = true;
      // TODO Probably listen up again for timer
    });
  }

  recordObtained = (record: Record) => {
    if (this.personalRecord === null) {
      this.personalRecord = {...record, user: this.player, scramble: this.scramblerCmpt.scramble}
      this.personalRoomSvc.addRecord(this.personalRoom.code, this.recordsCmpt.personalSolveUid, this.personalRecord).then((document) => {
        this.personalRecord.uid = document.id;
      });
    } else {
      this.listenToUpdates = false;
    }
  }

  recordUpdated = (record: Record) => {
    if (this.listenToUpdates) {
      this.personalRoomSvc.updateRecord(this.personalRoom.code, this.recordsCmpt.personalSolveUid, this.personalRecord.uid, record);
      this.personalRecord = {...this.personalRecord, ...record};
    }
  }

}
