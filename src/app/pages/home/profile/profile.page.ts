import { Component } from '@angular/core';
import { Action, DocumentSnapshot } from '@angular/fire/firestore';
import { AlertController, NavController, ToastController, ViewDidLeave, ViewWillEnter } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { MomentumUser } from 'src/app/models/momentum-user.class';
import { RoomType } from 'src/app/models/room-type.enum';
import { AuthService } from 'src/app/services/shared/auth.service';
import { UploadService } from 'src/app/services/upload.service';
import { Upload } from '../../../models/upload.class';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements ViewWillEnter, ViewDidLeave {

  isLoading: boolean = true;
  uploading: boolean;
  user: MomentumUser;
  upload: Upload;
  userSubscription: Subscription;
  RoomType = RoomType;

  constructor(public authSvc: AuthService,
              private uploadSvc: UploadService,
              private alertCtrl: AlertController,
              private navCtrl: NavController,
              private toastCtrl: ToastController) { }

  fileSelected = (inputFile: HTMLInputElement) => {
    let file = inputFile.files.item(0);
    this.upload = new Upload();
    this.upload.name = file.name;
    this.upload.file = file;
    this.uploading = true;
    this.uploadSvc.upload(this.upload)
      .then((snapshot) => {
        snapshot.ref.getDownloadURL().then((downloadURL: string) => {
          this.authSvc.update({photoURL: downloadURL}).then(() => this.uploading = false);
        });
    });
  }
  
  showEditUsername = (username: string) => {
    this.alertCtrl.create({
      header: "Actualiza",
      subHeader: "Tu nombre de usuario",
      message: "Ingresa un nuevo nombre de usuario",
      inputs: [{
        type: "text",
        value: username,
        name: "username"
      }],
      buttons: [{
        role: "cancel",
        text: "Cancelar"
      }, {
        text: "Guardar",
        handler: (data) => {
          let { username } = data;
          if (username.length > 0 && username.length <= 15) {
            this.authSvc.update({username})
          } else {
            this.toastCtrl.create({
              message: "Tu nombre debe contener de 1 a 15 letras",
              duration: 3000,
              buttons: ['Entendido'] }).then(toast => toast.present());
          }
        }
      }]
    }).then(alert => alert.present());
  }

  ionViewWillEnter = async () => {
    this.isLoading = true;
    this.userSubscription = this.authSvc.listenCurrentUserChanges().subscribe((action: Action<DocumentSnapshot<MomentumUser>>) => {
      this.user = action.payload.data();
      this.isLoading = false;
    });
  }
              
  ionViewDidLeave(): void {
    this.userSubscription && this.userSubscription.unsubscribe();
  }

  navigateToRegistries = (roomType: RoomType) => {
    if (roomType === RoomType.RANKED && this.user.rankedGames > 0) {
      this.navCtrl.navigateForward(['registry'], {state: {roomType}})
    } else if (roomType === RoomType.UNRANKED && this.user.unrankedGames > 0) {
      this.navCtrl.navigateForward(['registry'], {state: {roomType}})
    }
  }

  navigateToFriends = () => this.navCtrl.navigateForward(['friend']);

}
