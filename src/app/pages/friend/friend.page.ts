import { Component, OnInit, ViewChild } from '@angular/core';
import { ActionSheetController, IonList, LoadingController, ToastController } from '@ionic/angular';
import { FriendStatus } from 'src/app/models/friend-status.enum';
import { Friend } from 'src/app/models/friend.class';
import { AuthService } from 'src/app/services/shared/auth.service';
import { FriendService } from 'src/app/services/friend.service';
import { QuerySnapshot } from '@angular/fire/firestore';
import { MomentumUser } from 'src/app/models/momentum-user.class';
import { DatePipe } from '@angular/common';
import { ActionSheetButton } from '@ionic/core';

@Component({
  selector: 'app-friend',
  templateUrl: './friend.page.html',
  styleUrls: ['./friend.page.scss'],
})
export class FriendPage implements OnInit {

  segment: string = 'friends';
  searchText: string;
  isLoading: boolean = true;
  
  // all users segment
  users: Friend[];
  filteredUsers: Friend[]
  FriendStatus = FriendStatus;
  
  // my friends segment
  friends: Friend[];
  filteredFriends: Friend[];
  friendSearchText: string;

  constructor(private authSvc: AuthService,
              private friendSvc: FriendService,
              private toastCtrl: ToastController,
              private actionSheetCtrl: ActionSheetController,
              private datePipe: DatePipe,
              private loadingCtrl: LoadingController) { }
  
  ngOnInit() {
    this.loadUsers();
  }

  filterUsers = () => {
    if (this.searchText.length > 0) {
      this.filteredUsers = this.users.filter(friend => friend.username.toLowerCase().includes(this.searchText.toLowerCase()))
    } else {
      this.filteredUsers = [...this.users];
    }
  }

  filterFriends = () => {
    if (this.friendSearchText.length > 0) {
      this.filteredFriends = this.friends.filter(friend => friend.username.toLowerCase().includes(this.friendSearchText.toLowerCase()))
    } else {
      this.filteredFriends = [...this.friends];
    }
  }

  loadUsers = async (event?) => {
    const segment = event ? event.detail.value : 'friends';
    if (segment === 'users') {
      this.isLoading = true;
      const loading = await this.loadingCtrl.create({ message: 'Cargando...', spinner: 'dots', mode: 'ios' });
      await loading.present();
      this.friendSvc.getAllFriendsBut().then((snapshot: QuerySnapshot<Friend>) => {
        this.friends = snapshot.docs.map(doc => doc.data());
        this.authSvc.findAllButMe().then(async (snapshot: QuerySnapshot<MomentumUser>) => {
          this.users = snapshot.docs.map(doc => {
            const {uid, photoURL, username, email} = doc.data();
            const friend = this.friends.find(friend => friend.friendUid === uid);
            return {friendUid: uid, photoURL, userPhotoURL: this.authSvc.user.photoURL, username,
              userUsername: this.authSvc.user.username, email, userEmail: this.authSvc.user.email,
              creation: friend ? friend.creation : null, userUid: null, status: friend ? friend.status : null};
          }).filter(friend => friend.status !== FriendStatus.ACCEPTED);
          this.filteredUsers = [...this.users];
          const loading = await this.loadingCtrl.getTop();
          loading && await loading.dismiss();
          this.isLoading = false;
        });
      });
    } else if (segment === 'friends') {
      this.isLoading = true;
      const loading = await this.loadingCtrl.create({ message: 'Cargando...', spinner: 'dots', mode: 'ios' });
      await loading.present();
      this.friendSvc.getAllFriendsBut(FriendStatus.BLOCKED).then(async (snapshot: QuerySnapshot<Friend>) => {
        this.friends = snapshot.docs.map(doc => doc.data());
        this.filteredFriends = [...this.friends];
        const loading = await this.loadingCtrl.getTop();
        loading && await loading.dismiss();
        this.isLoading = false;
      });
    }
  }

  showFriendDetail = (friend: Friend) => {
    this.actionSheetCtrl.create({
      header: friend.username,
      subHeader: friend.status === FriendStatus.PENDING ?
        `Enviada desde ${this.datePipe.transform(friend.creation)}` :
        `Amigos desde ${this.datePipe.transform(friend.creation)}`,
      buttons: [{
        text: 'Cancelar',
        role: 'cancel',
        icon: 'close-circle'
      }, {
        text: 'Eliminar',
        cssClass: 'danger-button',
        icon: 'trash',
        handler: () => this.deleteFriendRequest(friend)
      }]
    }).then(actionSheet => actionSheet.present())
  }

  showUserDetail = (user: Friend) => {
    let buttons: ActionSheetButton[] = [{
      text: 'Cancelar',
      role: 'cancel',
      icon: 'close-circle'
    }];
    let subHeader = '';
    switch (user.status) {
      case FriendStatus.PENDING:
        buttons.push({text: 'Pendiente', icon: 'hourglass'})
        subHeader = `Enviada desde ${this.datePipe.transform(user.creation)}`;
        break;
      case FriendStatus.BLOCKED:
        buttons.push({text: 'Desbloquear', icon: 'checkmark-circle', handler: () => this.sendUnblockRequest(user)})
        subHeader = `Bloquedo desde ${this.datePipe.transform(user.creation)}`;
        break;
      default: 
        buttons.push({
          text: 'Agregar', icon: 'person-add', handler: () => this.sendFriendRequest(user)
        }, {
          text: 'Bloquear', icon: 'ban', cssClass: 'danger-button', handler: () => this.sendBlockRequest(user)
        })
        break;
    }
    this.actionSheetCtrl.create({ header: user.username, subHeader, buttons}).then(actionSheet => actionSheet.present())
  }

  sendFriendRequest = async (user: Friend) => {
    const loading = await this.loadingCtrl.create({ message: 'Enviando solicitud...', spinner: 'dots', mode: 'ios' });
    await loading.present();
    this.friendSvc.sendFriendRequest(user).then(async (status: FriendStatus) => {
      const loading = await this.loadingCtrl.getTop();
      loading && await loading.dismiss();
      if (status !== FriendStatus.BLOCKED) {
        user.status = status;
      } else {
        this.toastCtrl.create({message: 'No fue posible enviar la solicitud', duration: 3000}).then(toast => toast.present())
      }
    });
  }

  sendBlockRequest = async (user: Friend) => {
    const loading = await this.loadingCtrl.create({ message: 'Bloqueando...', spinner: 'dots', mode: 'ios' });
    await loading.present();
    this.friendSvc.sendBlockRequest(user).then(async () => {
      const loading = await this.loadingCtrl.getTop();
      loading && await loading.dismiss();
      user.status = FriendStatus.BLOCKED;
    });
  }

  sendUnblockRequest = async (user: Friend) => {
    const loading = await this.loadingCtrl.create({ message: 'Desbloqueando...', spinner: 'dots', mode: 'ios' });
    await loading.present();
    this.friendSvc.sendUnblockRequest(user).then(async () => {
      const loading = await this.loadingCtrl.getTop();
      loading && await loading.dismiss();
      user.status = null;
    });
  }

  deleteFriendRequest = async (user: Friend) => {
    const loading = await this.loadingCtrl.create({ message: 'Eliminando...', spinner: 'dots', mode: 'ios' });
    await loading.present();
    this.friendSvc.deleteFriendRequest(user).then(async () => {
      this.friends = this.friends.filter(friend => friend.friendUid !== user.friendUid);
      this.filteredFriends = [...this.friends];
      const loading = await this.loadingCtrl.getTop();
      loading && await loading.dismiss();
    });
  }

}
