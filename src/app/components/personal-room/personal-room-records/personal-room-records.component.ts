import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { DocumentChangeAction, DocumentData } from '@angular/fire/firestore';
import { ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { MomentumUser } from 'src/app/models/momentum-user.class';
import { PersonalRecord } from 'src/app/models/personal-record.class';
import { Player } from 'src/app/models/player.class';
import { Record } from 'src/app/models/record.class';
import { AuthService } from 'src/app/services/shared/auth.service';
import { PersonalRoomService } from 'src/app/services/playable-rooms/personal-room.service';
import { PersonalRoomHistoryComponent } from '../personal-room-history/personal-room-history.component';

@Component({
  selector: 'app-personal-room-records',
  templateUrl: './personal-room-records.component.html',
  styleUrls: ['./personal-room-records.component.scss'],
})
export class PersonalRoomRecordsComponent implements OnInit, OnDestroy {

  @Input() code: string;
  @Output() recordUpdated = new EventEmitter<Record>();

  loading: boolean = true;
  solveCount: number = 0;
  personalRecords: PersonalRecord[] = [];
  displayPersonalRecords: PersonalRecord[] = [];
  players: Player[] = [];
  personalSolveUid: string;
  
  personalRecordsSubscription: Subscription;
  playersSubscription: Subscription;

  constructor(private personalRoomSvc: PersonalRoomService,
              private authSvc: AuthService,
              private modalCtrl: ModalController) { }

  ngOnInit() {
    this.playersSubscription = this.personalRoomSvc.listenToPlayers(this.code).subscribe((documents: DocumentChangeAction<Player>[]) => {
      this.players = documents.map(document => { return {...document.payload.doc.data(), uid: document.payload.doc.id} })
      this.updatePersonalRecords();
      this.loading = false;
    });
  }

  ngOnDestroy() {
    this.personalRecordsSubscription && this.personalRecordsSubscription.unsubscribe()
  }

  canEdit = (user: Player) => this.authSvc.user.uid === user.uid;

  setPersonalSolveUid = (personalSolveUid: string) => {
    this.personalSolveUid = personalSolveUid;
    this.personalRecordsSubscription && this.personalRecordsSubscription.unsubscribe();
    this.personalRecordsSubscription = this.personalRoomSvc.listenToSolves(this.code, personalSolveUid).subscribe((documents: DocumentData[]) => {
      this.personalRecords = documents as PersonalRecord[];
      this.updatePersonalRecords();
    });
  }

  _recordUpdated = (record: Record) => this.recordUpdated.emit(record);

  updatePersonalRecords = () => {
    const players = this.players.filter(player => this.personalRecords.find(personalRecord => personalRecord.user.uid === player.uid) === undefined);
    this.displayPersonalRecords = this.personalRecords.concat(players.sort((a, b) => a.active === b.active ? 0 : a ? 1 : -1)
      .map(player => { return {user: player, ...new Record()} }));
  }

  showHistory = () => {
    this.modalCtrl.create({component: PersonalRoomHistoryComponent, componentProps: {code: this.code}}).then(modal => modal.present())
  }

  setPersonalSolveCount(length: number) {
    this.solveCount = length;
  }

  incrementSolveCount(): any {
    this.solveCount++;
  }

}
