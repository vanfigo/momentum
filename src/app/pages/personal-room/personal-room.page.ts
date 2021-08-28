import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Action, DocumentData, DocumentSnapshot } from '@angular/fire/firestore';
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

  uid: string;
  hostUid: string;
  player: Player;
  personalRecord: PersonalRecord = null;
  listenToUpdates: boolean = true;
  loading: boolean = true;
  personalRoomSubscription: Subscription;
  scrambleSubscription: Subscription;
  @ViewChild(ScramblerComponent, {static: false}) scramblerCmpt: ScramblerComponent;
  @ViewChild(PersonalRoomRecordsComponent, {static: false}) historyCmpt: PersonalRoomRecordsComponent;

  constructor(private route: ActivatedRoute,
              private authSvc: AuthService,
              private personalRoomSvc: PersonalRoomService) { }

  ngOnInit() {
    this.uid = this.route.snapshot.params['uid'];
    this.authSvc.getUserFromDB().then((userSnapshot: DocumentSnapshot<MomentumUser>) => {
      this.personalRoomSvc.setActive(this.uid, true);
      const { photoURL, email, username, uid } = {...userSnapshot.data() as MomentumUser, uid: userSnapshot.id};
      this.player = {photoURL, email, username, uid, active: true};
      this.personalRoomSubscription && this.personalRoomSubscription.unsubscribe()
      this.personalRoomSubscription = this.personalRoomSvc.listenToPersonalRoom(this.uid).subscribe((action: Action<DocumentSnapshot<PersonalRoom>>) => {
        switch(action.type) {
          case 'added': {
            const {hostUid, currentPersonalSolveUid} = action.payload.data();
            this.hostUid = hostUid;
            currentPersonalSolveUid && this.listenToSolves(currentPersonalSolveUid)
            break;
          }
          case 'modified': {
            const {currentPersonalSolveUid} = action.payload.data();
            currentPersonalSolveUid && this.listenToSolves(currentPersonalSolveUid)
            break;
          }
        }
        this.loading = false;
      })
    })
    
  }

  ngOnDestroy() {
    this.personalRoomSubscription && this.personalRoomSubscription.unsubscribe();
    this.scrambleSubscription && this.scrambleSubscription.unsubscribe();
  }

  isHost = () => this.authSvc.user.uid === this.hostUid;

  updateScramble = () => {
    this.scramblerCmpt.updateScramble();
  }

  updateCurrentScramble = (scramble: string ) => {
    if (this.isHost()) {
      this.personalRoomSvc.updateCurrentScramble(this.uid, scramble);
      this.personalRecord && this.personalRoomSvc.addHistory(this.uid, this.personalRecord);
    }
  }

  listenToSolves = (personalSolveUid: string) => {
    // TODO push last solve to the players collection
    if (this.personalRecord !== null) {
      !this.isHost() && this.personalRoomSvc.addHistory(this.uid, this.personalRecord);
    }
    this.scrambleSubscription && this.scrambleSubscription.unsubscribe();
    this.scrambleSubscription = this.personalRoomSvc.listenToScramble(this.uid, personalSolveUid).subscribe((document: DocumentData) => {
      const {scramble} = document;
      this.scramblerCmpt.setScramble(scramble);
      this.historyCmpt.setPersonalSolveUid(personalSolveUid);
      this.personalRecord = null;
      this.listenToUpdates = true;
    });
  }

  recordObtained = (record: Record) => {
    if (this.personalRecord === null) {
      this.personalRecord = {...record, user: this.player, scramble: this.scramblerCmpt.scramble}
      this.personalRoomSvc.addRecord(this.uid, this.historyCmpt.personalSolveUid, this.personalRecord).then((document) => {
        this.personalRecord.uid = document.id;
      });
    } else {
      this.listenToUpdates = false;
    }
  }

  recordUpdated = (record: Record) => {
    if (this.listenToUpdates) {
      this.personalRoomSvc.updateRecord(this.uid, this.historyCmpt.personalSolveUid, this.personalRecord.uid, record);
      this.personalRecord = {...this.personalRecord, ...record};
    }
  }

}
