import { Component, OnInit, ViewChild } from '@angular/core';
import { DocumentData, DocumentReference } from '@angular/fire/firestore';
import { AngularFireFunctions } from '@angular/fire/functions';
import { ActivatedRoute } from '@angular/router';
import { PlayingRoomHistoryComponent } from 'src/app/components/playing-room/playing-room-history/playing-room-history.component';
import { ScramblerComponent } from 'src/app/components/shared/scrambler/scrambler.component';
import { TimerComponent } from 'src/app/components/shared/timer/timer.component';
import { MomentumUser } from 'src/app/models/momentum-user.class';
import { Record } from 'src/app/models/record.class';
import { Room } from 'src/app/models/room.class';
import { AuthService } from 'src/app/services/auth.service';
import { RoomService } from 'src/app/services/room.service';

@Component({
  selector: 'app-ranked-room',
  templateUrl: './ranked-room.page.html',
  styleUrls: ['./ranked-room.page.scss'],
})
export class RankedRoomPage implements OnInit {

  @ViewChild(ScramblerComponent, {static: false}) scramblerCmpt: ScramblerComponent;
  @ViewChild(PlayingRoomHistoryComponent, {static: false}) historyCmpt: PlayingRoomHistoryComponent;
  @ViewChild(TimerComponent, {static: false}) timerComponent: TimerComponent;

  loading = true;
  roomUid: string;
  opponent: MomentumUser;
  room: Room;
  record: Record;

  constructor(private route: ActivatedRoute,
              private roomSvc: RoomService,
              private authSvc: AuthService,
              private fireFunctions: AngularFireFunctions) {
    this.roomUid = route.snapshot.params['uid'];
    this.roomSvc.geByUid(this.roomUid).toPromise()
    .then(room => {
      this.room = room;
      this.opponent = this.room.users.find(user => user.uid !== this.authSvc.user.uid);
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
    this.roomSvc.updateRecord(this.room.uid, record)
      .then(() => {
        this.historyCmpt.updateRecord(record);
      })
  };

  lastScramble = () => {
    setTimeout(() => this.timerComponent.stopListeningTimer(), 300);
  }

  gameCompleted = () => {
    console.log('gameCompleted');
    // this.fireFunctions.httpsCallable('endGame')({uid: this.room.uid}).subscribe();
    this.roomSvc.completeRoom(this.roomUid);
  }

  ngOnInit() {
  }

}
