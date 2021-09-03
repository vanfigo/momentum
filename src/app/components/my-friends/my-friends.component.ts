import { Component, ViewChild } from '@angular/core';
import { IonList } from '@ionic/angular';
import { FriendStatus } from 'src/app/models/friend-status.enum';
import { Friend } from 'src/app/models/friend.class';
import { FriendService } from 'src/app/services/friend.service';

@Component({
  selector: 'app-my-friends',
  templateUrl: './my-friends.component.html',
  styleUrls: ['./my-friends.component.scss'],
})
export class MyFriendsComponent {

  loading: boolean = true;
  friends: Friend[];
  filteredFriends: Friend[];
  searchText: string;
  FriendStatus = FriendStatus;

  @ViewChild('ionListFriends', {static: false}) friendsList: IonList;

  constructor(private friendSvc: FriendService) {
    this.friendSvc.getAllFriendsBut(FriendStatus.BLOCKED).then((snapshot) => {
      this.friends = snapshot.docs.map(doc => doc.data());
      this.filteredFriends = [...this.friends];
      this.loading = false;
    });
  }

  loadFriends = () => {
    if (this.searchText.length > 0) {
      this.filteredFriends = this.friends.filter(friend => friend.username.toLowerCase().includes(this.searchText.toLowerCase()))
    } else {
      this.filteredFriends = [...this.friends];
    }
  }

  deleteFriendRequest = (user: Friend) => this.friendSvc.deleteFriendRequest(user).then(() => {
    this.friendsList.closeSlidingItems().then(() => {
      this.friends = this.friends.filter(friend => friend.friendUid !== user.friendUid);
      this.filteredFriends = [...this.friends];
    });
  });

}
