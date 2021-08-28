import { AfterContentInit, ChangeDetectorRef, Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { DocumentReference } from '@angular/fire/firestore';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { IonCheckbox, IonInput, ModalController, NavController, ViewDidEnter } from '@ionic/angular';
import { FriendStatus } from 'src/app/models/friend-status.enum';
import { Friend } from 'src/app/models/friend.class';
import { PersonalRoom } from 'src/app/models/personal-room.class';
import { AuthService } from 'src/app/services/auth.service';
import { FriendService } from 'src/app/services/friend.service';
import { PersonalRoomService } from 'src/app/services/personal-room.service';

@Component({
  selector: 'app-create-personal-room',
  templateUrl: './create-personal-room.page.html',
  styleUrls: ['./create-personal-room.page.scss'],
})
export class CreatePersonalRoomPage implements ViewDidEnter {
  
  personalRoomForm: FormGroup;
  @ViewChild(IonInput, {static: false}) name: IonInput;

  loading: boolean = true;
  friends: Friend[];
  filteredFriends: Friend[];
  selectedFriends: Friend[] = [];
  searchText: string;
  showFriends: boolean = true;
  @ViewChildren(IonCheckbox) friendCheckbox: QueryList<IonCheckbox>;

  constructor(public modalCtrl: ModalController,
              private friendSvc: FriendService,
              private personalRoomSvc: PersonalRoomService,
              private authSvc: AuthService,
              private navCtrl: NavController,
              private route: ActivatedRoute,
              private changeDetector: ChangeDetectorRef) {
    this.personalRoomForm = new FormGroup({
      name: new FormControl(''), isPrivate: new FormControl(this.showFriends)
    });
    this.friendSvc.getAllFriendsBut(FriendStatus.BLOCKED, FriendStatus.PENDING).then((snapshot) => {
      this.friends = snapshot.docs.map(doc => {return {...doc.data(), uid: doc.id}});
      this.filteredFriends = [...this.friends];
      this.loading = false;
    });
  }

  ionViewDidEnter() {
    this.name.setFocus();
  }

  createRoom = () => {
    const {name, isPrivate} = this.personalRoomForm.value;
    this.personalRoomSvc.create({
      hostUid: this.authSvc.user.uid,
      creation: new Date().getTime(),
      currentPersonalSolveUid: null,
      name, isPrivate
    }, this.selectedFriends.map(friend => { return {
      uid: friend.friendUid,
      photoURL: friend.photoURL,
      username: friend.username,
      email: friend.email,
      active: false
    }})).then((uid: string) => {
      this.navCtrl.navigateForward([uid], {relativeTo: this.route})
    })
  }

  loadFriends = () => {
    if (this.searchText.length > 0) {
      this.filteredFriends = this.friends.filter(friend => friend.username.toLowerCase().includes(this.searchText.toLowerCase()))
    } else {
      this.filteredFriends = [...this.friends];
    }
    this.changeDetector.detectChanges();
    this.updateSelectedCheckBox()
  }

  toggleHideFriends = (event: any) => {
    this.showFriends = event.detail.checked;
    if (!this.showFriends) {
      this.selectedFriends = [];
    }
    
  };
  
  selectFriend = (event: any, friend: Friend) => {
    if (event.detail.checked) {
      if (!this.selectedFriends.find(selectedFriend => selectedFriend.uid === friend.uid)) {
        this.selectedFriends.push({...friend});
      }
    } else {
      this.selectedFriends = this.selectedFriends.filter(_friend => _friend.uid !== friend.uid);
    }
  }
  
  updateSelectedCheckBox = () => this.friendCheckbox.forEach((checkBox: IonCheckbox) => {
    if (this.selectedFriends.find((friend: Friend) => checkBox.name === friend.uid)) {
      checkBox.checked = true;
    }
  })

}
