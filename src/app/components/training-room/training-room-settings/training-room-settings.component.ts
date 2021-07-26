import { Component, OnInit } from '@angular/core';
import { AlertController, IonItemSliding, ModalController, ToastController } from '@ionic/angular';
import { CategoryType } from 'src/app/models/category-type.enum';
import { Session } from 'src/app/models/session.class';
import { TrainingRoomService } from 'src/app/services/training-room.service';

@Component({
  selector: 'app-training-room-settings',
  templateUrl: './training-room-settings.component.html',
  styleUrls: ['./training-room-settings.component.scss'],
})
export class TrainingRoomSettingsComponent implements OnInit {

  segment: string = "session";
  CategoryType = CategoryType;

  constructor(public modalCtrl: ModalController,
              public alertCtrl: AlertController,
              public toastCtrl: ToastController,
              public trainingRoomSvc: TrainingRoomService) { }

  ngOnInit() {}

  showAddSession = () => {
    this.alertCtrl.create({
      header: 'Agrega sesion',
      message: 'Selecciona el nombre de tu nueva sesion',
      inputs: [{
        name: 'session',
        type: 'text'
      }],
      buttons: [{
        text: 'Cancelar',
        role: 'cancel'
      }, {
        text: 'Agregar',
        handler: (data) => {
          let { session } = data;
          this.trainingRoomSvc.addSession(session)
        }
      }]
    })
    .then(alert => alert.present());
  }

  showEditSession = (session: Session, sliding: IonItemSliding) => {
    this.alertCtrl.create({
      header: 'Edita sesion',
      message: 'Modifica el nombre de la sesion',
      inputs: [{
        name: 'sessionName',
        value: session.name,
        type: 'text'
      }],
      buttons: [{
        text: 'Cancelar',
        role: 'cancel'
      }, {
        text: 'Guardar',
        handler: (data) => {
          let { sessionName } = data;
          this.trainingRoomSvc.editSession(session.id, sessionName);
          sliding.close();
        }
      }]
    })
    .then(alert => alert.present());
  }

  sessionSelected = (event) => {
    if (event.detail?.value !== undefined) {
      this.trainingRoomSvc.selectSession(event.detail.value);
    }
  }

  deleteSession = (session: Session) => {
    if (this.trainingRoomSvc.room.sessions.length > 1) {
      this.alertCtrl.create({
        header: 'Borrar sesion',
        message: `En realidad quieres borrar la sesion ${session.name}`,
        buttons: ['Cancelar', {
          text: 'Borrar',
          handler: () => {
            this.trainingRoomSvc.deleteSession(session.id);
          }
        }]
      }).then(alert => alert.present());
    } else {
      this.toastCtrl.create({
        message: 'No puedes eliminar la ultima sesion',
        duration: 4000
      }).then(toast => toast.present());
    }
  }

  categorySelected = (event: Event) => {}

}
