import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController, NavController, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { MomentumUser } from 'src/app/models/momentum-user.class';
import { Record } from 'src/app/models/record.class';
import { AuthService } from 'src/app/services/auth.service';
import { RoomService } from 'src/app/services/room.service';

@Component({
  selector: 'app-playing-room-history',
  templateUrl: './playing-room-history.component.html',
  styleUrls: ['./playing-room-history.component.scss'],
})
export class PlayingRoomHistoryComponent implements OnInit, OnDestroy {

  @Input() opponentPlayer: MomentumUser;
  @Input() scramblesToComplete: number;
  @Output() recordUpdated: EventEmitter<Record> = new EventEmitter();
  @Output() gameCompleted: EventEmitter<void> = new EventEmitter();

  opponentPlayerSubscription: Subscription;
  opponentFinished: boolean = false;
  validatingLastSolve: boolean = false;
  solveValidated: boolean = false;
  waiting: boolean = false;
  roomUid: string;
  records: Record[] = [];
  opponentRecords: Record[] = [];

  constructor(private roomSvc: RoomService,
              private route: ActivatedRoute,
              public authSvc: AuthService,
              private toastCtrl: ToastController,
              private alertCtrl: AlertController,
              private navCtrl: NavController) {
    this.roomUid = route.snapshot.params['uid'];
  }

  ngOnInit(): void {
    if (this.opponentPlayerSubscription === undefined || this.opponentPlayerSubscription.closed) {
      this.opponentPlayerSubscription = this.roomSvc.listenSolvesForOpponentPlayer(this.roomUid, this.opponentPlayer.uid).subscribe((records: Record[]) => {
        this.opponentRecords = records;
        this.validateCompletion();
      });
    }
  }

  ngOnDestroy(): void {
    this.opponentPlayerSubscription.unsubscribe();
  }

  addRecord = (record: Record) => {
    this.records.push(record);
    this.validateCompletion();
  }

  updateRecord = (record: Record) => {
    if (record.uid === undefined) {
      const _record = this.records[this.records.length - 1];
      this.records[this.records.length - 1] = {...record, uid: _record.uid};
    }
  }

  cardRecordUpdated = (record: Record) => {
    this.recordUpdated.emit(record);
  }

  getColor = (index: number) => {
    if (index < this.records.length && index < this.opponentRecords.length) {
      const record = this.records[index];
      const opponentRecord = this.opponentRecords[index];
      if (record.dnf) {
        if (opponentRecord.dnf) {
          return 'warning';
        }
        return 'danger';
      } else if (opponentRecord.dnf) {
        return 'success';
      }
      return record.time === opponentRecord.time ? 'warning' : record.time < opponentRecord.time ? 'success' : 'danger'
    }
    return '';
  }

  validateCompletion = async () => {
    if (!this.validatingLastSolve) {
      if (this.records.length === this.scramblesToComplete) {
        if (this.opponentRecords.length === this.scramblesToComplete) {
          // TODO completed, calcluate average, update room status, notify user
          const alert = await this.alertCtrl.getTop();
          alert && alert.dismiss();
          const toast = await this.toastCtrl.getTop();
          toast && toast.dismiss();
          if (this.solveValidated) {
            this.gameCompleted.emit();
          } else {
            this.validatingLastSolve = true;
            setTimeout(() => {
              this.validatingLastSolve = false;
              this.solveValidated = true;
              this.validateCompletion();
            }, 5000);
          }
          return true;
        } else if (!this.waiting) {
          if (this.solveValidated) {
            this.alertCtrl.getTop()
            .then(alert => {
              if (!alert) {
                this.alertCtrl.create({
                  backdropDismiss: false,
                  header: "Felicidades!",
                  subHeader: "Has completado todos los solves",
                  message: "Tu oponente aun no termina, deseas esperar o continuar jugando?",
                  buttons: [{
                    text: 'Esperar',
                    handler: () => this.waiting = true
                  }, {
                    text: 'Salir',
                    role: 'cancel',
                    handler: () => {
                      this.navCtrl.navigateBack(["home", "play"], { relativeTo: this.route });
                    }
                  }]
                }).then(alert => alert.present());
              }
            })
          } else {
            // tiempo de espera para corregir ultimo
            this.validatingLastSolve = true;
            setTimeout(() => {
              this.validatingLastSolve = false;
              this.solveValidated = true;
              this.validateCompletion();
            }, 5000);
          }
        }
      } else if (this.opponentRecords.length === this.scramblesToComplete) {
        // TODO notify user that user is pending
        this.toastCtrl.getTop()
          .then(toast => {
            if (!toast) {
              this.toastCtrl.create({ message: 'Tu oponente ha terminado', color: 'primary', buttons: [{ text: 'Entendido' }] }).then(toast => toast.present())
            }
          });
      }
    }
    return false;
  }

}
