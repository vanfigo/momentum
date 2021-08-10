import { Component, ViewChild } from '@angular/core';
import { DocumentChangeAction, DocumentData, DocumentReference } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { LoadingController, ModalController, NavController, ViewDidLeave } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { OnlineRoomHistoryComponent } from 'src/app/components/online-room/online-room-history/online-room-history.component';
import { RegistryDetailComponent } from 'src/app/components/shared/registry-detail/registry-detail.component';
import { ScramblerComponent } from 'src/app/components/shared/scrambler/scrambler.component';
import { TimerComponent } from 'src/app/components/shared/timer/timer.component';
import { MomentumUser } from 'src/app/models/momentum-user.class';
import { Record } from 'src/app/models/record.class';
import { Registry } from 'src/app/models/registry.class';
import { Room } from 'src/app/models/room.class';
import { AuthService } from 'src/app/services/auth.service';
import { RegistryService } from 'src/app/services/registry.service';
import { RoomService } from 'src/app/services/room.service';

@Component({
  selector: 'app-online-room',
  templateUrl: './online-room.page.html',
  styleUrls: ['./online-room.page.scss'],
})
export class OnlineRoomPage implements ViewDidLeave {

  @ViewChild(ScramblerComponent, {static: false}) scramblerCmpt: ScramblerComponent;
  @ViewChild(OnlineRoomHistoryComponent, {static: false}) historyCmpt: OnlineRoomHistoryComponent;
  @ViewChild(TimerComponent, {static: false}) timerComponent: TimerComponent;

  loading = true;
  roomUid: string;
  opponent: MomentumUser;
  user: MomentumUser;
  room: Room;
  record: Record;
  registrySubscription: Subscription;

  constructor(private route: ActivatedRoute,
              private roomSvc: RoomService,
              private authSvc: AuthService,
              private loadingCtrl: LoadingController,
              private registrySvc: RegistryService,
              private modalCtrl: ModalController,
              private navCtrl: NavController) {
    this.roomUid = route.snapshot.params['uid'];
    this.roomSvc.geByUid(this.roomUid).toPromise()
    .then(room => {
      this.room = room;
      this.opponent = this.room.users.find(user => user.uid !== this.authSvc.user.uid);
      this.user = this.room.users.find(user => user.uid === this.authSvc.user.uid);
      this.loading = false;
    });
  }

  recordObtained = (record: Record) => {
    record.scramble = this.scramblerCmpt.scramble;
    this.roomSvc.addRecord(this.room.uid, record)
      .then((document: DocumentReference) => {
        document.get()
          .then((record: DocumentData) => {
            this.record = {...record.data(), uid: record.id};
            this.historyCmpt.addRecord(this.record);
            this.scramblerCmpt.getNextScramble();
          })
      });
  }

  recordUpdated = (record: Record) => {
    record.uid = record.uid ? record.uid : this.record.uid;
    this.roomSvc.updateRecord(this.room.uid, record)
      .then(() => {
        this.historyCmpt.updateRecord(record);
      })
  };

  lastScramble = () => {
    setTimeout(() => this.timerComponent.stopListeningTimer(), 300);
  }

  gameCompleted = () => {
    this.loadingCtrl.create({
      message: 'Finalizando partida...',
      spinner: 'dots'
    }).then(loading => {
      loading.present();
      this.roomSvc.completeRoom(this.roomUid);
      this.registrySubscription = this.registrySvc.listenToRegistry(this.roomUid, this.authSvc.user.uid)
        .subscribe((actions: DocumentChangeAction<Registry>[]) => {
          actions.forEach(async (action: DocumentChangeAction<Registry>) => {
            if (action.type === "added") {
              loading.dismiss();
              const modal = await this.modalCtrl.create({
                component: RegistryDetailComponent,
                componentProps: {
                  registry: action.payload.doc.data(),
                  scramblesToComplete: this.room.scrambles.length
                }
              });
              modal.present();
              this.navCtrl.navigateForward(["/home/play"], {relativeTo: this.route});
              modal.onWillDismiss().then(() => {
                // this.navCtrl.navigateForward(["/home/play"], {relativeTo: this.route});
              })
            }
          })
        })
    });
  }

  ionViewDidLeave(): void {
    this.registrySubscription && this.registrySubscription.unsubscribe();
  }

}
