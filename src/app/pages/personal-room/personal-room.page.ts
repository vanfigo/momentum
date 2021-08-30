import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Action, DocumentData, DocumentSnapshot, QuerySnapshot } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { PersonalRoomRecordsComponent } from 'src/app/components/personal-room/personal-room-records/personal-room-records.component';
import { ScramblerComponent } from 'src/app/components/shared/scrambler/scrambler.component';
import { MomentumUser } from 'src/app/models/momentum-user.class';
import { PersonalRecord } from 'src/app/models/personal-record.class';
import { PersonalRoom } from 'src/app/models/personal-room.class';
import { Player } from 'src/app/models/player.class';
import { Record } from 'src/app/models/record.class';
import { AuthService } from 'src/app/services/auth.service';
import { PersonalRoomService } from 'src/app/services/personal-room.service';

@Component({
  selector: 'app-personal-room',
  templateUrl: './personal-room.page.html',
  styleUrls: ['./personal-room.page.scss'],
})
export class PersonalRoomPage implements OnInit, OnDestroy {

  personalRoom: PersonalRoom;
  player: Player;
  personalRecord: PersonalRecord = null;
  listenToUpdates: boolean = true;
  loading: boolean = true;
  personalRoomSubscription: Subscription;
  @ViewChild(ScramblerComponent, {static: false}) scramblerCmpt: ScramblerComponent;
  @ViewChild(PersonalRoomRecordsComponent, {static: false}) recordsCmpt: PersonalRoomRecordsComponent;

  constructor(private route: ActivatedRoute,
              private authSvc: AuthService,
              private personalRoomSvc: PersonalRoomService) { }

  ngOnInit() {
    // get personal-room info
    this.personalRoomSvc.getByCode(this.route.snapshot.params['code'])
      .then(async (snapshot) => {
        if (snapshot.exists) {
          this.personalRoom = {...snapshot.data()};
          // get players added (isPriavte ? friends added : people accessed this public room)
          const playersSnapshot = await this.personalRoomSvc.getPlayers(this.personalRoom.code);
          const playerFound = playersSnapshot.docs.find(snapshot => snapshot.data().uid === this.authSvc.user.uid)
          if (this.personalRoom.isPrivate) {
            if (playerFound !== undefined) {
              await this.personalRoomSvc.setActive(this.personalRoom.code, true);
              this.player = {...playerFound.data() as Player, active: true};
            } else {
              // TODO show alert and close personal room page (navigate to home)
            }
          } else { // public room
            if (playerFound === undefined) { // not in players list
              const userSnapshot = await this.authSvc.getUserFromDB();
              const { uid, username, email, photoURL } = {...userSnapshot.data() as MomentumUser, uid: userSnapshot.id};
              this.player = { uid, username, email, photoURL, active: true }
              await this.personalRoomSvc.addPlayer(this.personalRoom.code, this.player);
            } else { // player already in public personal-room
              // This piece of code should never be called, but is better to have it, since a public player will be pop from players list once it exits
              await this.personalRoomSvc.setActive(this.personalRoom.code, true);
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
              case 'deleted':
                // TODO display message on host left and navigate to home
                break;
            }
            this.loading = false;
            this.personalRoomSvc.getHistoryCount(this.personalRoom.code).then((snapshot: QuerySnapshot<PersonalRecord>) =>
              this.recordsCmpt.setPersonalSolveCount(snapshot.docs.length));
          });
          window.addEventListener('beforeunload', this.exitPersonalRoom);
        } else {
          // TODO show alert and close personal room page (navigate to home)
        }
      });
  }

  ngOnDestroy() {
    this.personalRoomSubscription && this.personalRoomSubscription.unsubscribe();
    this.exitPersonalRoom()
  }

  exitPersonalRoom = () => {
    if (this.isHost()) {
      // TODO delete the personal-room
    } else {
      if (this.personalRoom.isPrivate) {
        this.personalRoomSvc.setActive(this.personalRoom.code, false);
      } else {
        this.personalRoomSvc.removePlayer(this.personalRoom.code);
      }
    }
  }

  isHost = () => this.authSvc.user.uid === this.personalRoom.hostUid;

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
