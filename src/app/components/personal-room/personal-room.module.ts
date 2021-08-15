import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreatePersonalRoomComponent } from './create-personal-room/create-personal-room.component';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule
  ],
  declarations: [CreatePersonalRoomComponent],
  exports: [CreatePersonalRoomComponent]
})
export class PersonalRoomModule { }
