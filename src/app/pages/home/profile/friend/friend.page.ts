import { Component, ViewChild } from '@angular/core';
import { IonList, ToastController } from '@ionic/angular';
import { FriendStatus } from 'src/app/models/friend-status.enum';
import { Friend } from 'src/app/models/friend.class';
import { AuthService } from 'src/app/services/shared/auth.service';
import { FriendService } from 'src/app/services/friend.service';

@Component({
  selector: 'app-friend',
  templateUrl: './friend.page.html',
  styleUrls: ['./friend.page.scss'],
})
export class FriendPage {

  segment: string = 'friends';
  searchText: string;
  loading: boolean = true;
  
  friends: Friend[];
  users: Friend[];
  filteredUsers: Friend[]
  FriendStatus = FriendStatus;

  @ViewChild('ionListUsers', {static: false}) usersList: IonList;

  constructor(private authSvc: AuthService,
              private friendSvc: FriendService,
              private toastCtrl: ToastController) { }
  filterUsers = () => {
    if (this.searchText.length > 0) {
      this.filteredUsers = this.users.filter(friend => friend.username.toLowerCase().includes(this.searchText.toLowerCase()))
    } else {
      this.filteredUsers = [...this.users];
    }
  }

  loadUsers = (event) => {
    if (event.detail.value === 'users') {
      this.loading = true;
      this.friendSvc.getAllFriendsBut().then((snapshot) => {
        this.friends = snapshot.docs.map(doc => doc.data());
        this.authSvc.findAllButMe().then((snapshot) => {
          this.users = snapshot.docs.map(doc => {
            const {uid, photoURL, username, email} = doc.data();
            const friend = this.friends.find(friend => friend.friendUid === uid);
            return {friendUid: uid, photoURL, userPhotoURL: this.authSvc.user.photoURL, username,
              userUsername: this.authSvc.user.username, email, userEmail: this.authSvc.user.email,
              creation: null, userUid: null, status: friend ? friend.status : null};
          }).filter(friend => friend.status !== FriendStatus.ACCEPTED);
          this.filteredUsers = [...this.users];
          this.loading = false;
        });
      });
    }
  }

  sendFriendRequest = (user: Friend) => this.friendSvc.sendFriendRequest(user).then((status: FriendStatus) => {
    this.usersList.closeSlidingItems().then(() => {
      if (status !== FriendStatus.BLOCKED) {
        user.status = status;
      } else {
        this.toastCtrl.create({message: 'No fue posible enviar la solicitud', duration: 3000}).then(toast => toast.present())
      }
    });
  });

  sendBlockRequest = (user: Friend) => this.friendSvc.sendBlockRequest(user).then(() => {
    this.usersList.closeSlidingItems().then(() => {
      user.status = FriendStatus.BLOCKED;
    });
  });

  sendUnblockRequest = (user: Friend) => this.friendSvc.sendUnblockRequest(user).then(() => {
    this.usersList.closeSlidingItems().then(() => {
      user.status = null;
    });
  });

}
