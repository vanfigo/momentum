import { AfterViewInit, ChangeDetectorRef, Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { IonCheckbox, IonInput, LoadingController, ModalController, NavController, ViewDidEnter } from '@ionic/angular';
import { FriendStatus } from 'src/app/models/friend-status.enum';
import { Friend } from 'src/app/models/friend.class';
import { AdService } from 'src/app/services/ad.service';
import { AuthService } from 'src/app/services/auth.service';
import { FriendService } from 'src/app/services/friend.service';
import { PersonalRoomService } from 'src/app/services/personal-room.service';

@Component({
  selector: 'app-personal-room-create',
  templateUrl: './personal-room-create.component.html',
  styleUrls: ['./personal-room-create.component.scss'],
})
export class PersonalRoomCreateComponent {
  
  personalRoomForm: FormGroup;

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
              private changeDetector: ChangeDetectorRef,
              private loadingCtrl: LoadingController,
              private adSvc: AdService) {
    this.personalRoomForm = new FormGroup({
      name: new FormControl(''), isPrivate: new FormControl(this.showFriends)
    });
    this.friendSvc.getAllFriendsBut(FriendStatus.BLOCKED, FriendStatus.PENDING).then((snapshot) => {
      this.friends = snapshot.docs.map(doc => {return {...doc.data(), uid: doc.id}});
      this.filteredFriends = [...this.friends];
      this.loading = false;
    });
  }

  createRoom = () => {
    this.loadingCtrl.create({
      message: 'Creando sala...',
      spinner: 'dots'
    }).then (async (loading) => {
      await loading.present()
      const {name, isPrivate} = this.personalRoomForm.value;
      const code: string = await this.personalRoomSvc.getCode();
      this.personalRoomSvc.create({
        hostUid: this.authSvc.user.uid,
        hostUsername: this.authSvc.user.username,
        hostPhotoURL: this.authSvc.user.photoURL,
        hostEmail: this.authSvc.user.email,
        creation: new Date().getTime(),
        currentPersonalSolveUid: null,
        name, isPrivate, code
      }, this.selectedFriends.map(friend => { return {
        uid: friend.friendUid,
        photoURL: friend.photoURL,
        username: friend.username,
        email: friend.email,
        active: false
      }})).then(async () => {
        await this.modalCtrl.dismiss();
        this.adSvc.showInterstitial(async () => {
          await loading.dismiss();
          this.navCtrl.navigateForward(["/personal-room", code], {relativeTo: this.route})
        })
      })
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
