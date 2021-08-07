import { Component } from '@angular/core';
import { Action, DocumentSnapshot } from '@angular/fire/firestore';
import { AlertController, ViewDidLeave, ViewWillEnter } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { MomentumUser } from 'src/app/models/momentum-user.class';
import { AuthService } from 'src/app/services/auth.service';
import { UploadService } from 'src/app/services/upload.service';
import { Upload } from '../../models/upload.class';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements ViewWillEnter, ViewDidLeave {

  loading: boolean = true;
  uploading: boolean;
  user: MomentumUser;
  upload: Upload;
  userSubscription: Subscription;

  constructor(private authSvc: AuthService,
              private uploadSvc: UploadService,
              private alertCtrl: AlertController) {
  }

  fileSelected = (inputFile: HTMLInputElement) => {
    let file = inputFile.files.item(0);
    this.upload = new Upload();
    this.upload.name = file.name;
    this.upload.file = file;
    this.uploading = true;
    this.uploadSvc.upload(this.upload)
      .then((snapshot) => {
        snapshot.ref.getDownloadURL().then((downloadURL: string) => {
          this.authSvc.update({photoUrl: downloadURL}).then(() => this.uploading = false);
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
          this.authSvc.update({username})
        }
      }]
    }).then(alert => alert.present());
  }

  ionViewWillEnter = async () => {
    this.loading = true;
    this.userSubscription = this.authSvc.listenCurrentUserChanges().subscribe((action: Action<DocumentSnapshot<MomentumUser>>) => {
      this.user = action.payload.data();
      this.loading = false;
    });
  }
              
  ionViewDidLeave(): void {
    this.userSubscription && this.userSubscription.unsubscribe();
  }

}
