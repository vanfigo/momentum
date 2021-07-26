import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { TrainingRoomAverageComponent } from './training-room-average/training-room-average.component';
import { TrainingRoomSettingsComponent } from './training-room-settings/training-room-settings.component';
import { SharedModule } from '../shared/shared.module';
import { FormsModule } from '@angular/forms';

@NgModule({
    imports: [
      CommonModule,
      IonicModule,
      FormsModule,
      SharedModule
    ],
    declarations: [
      TrainingRoomAverageComponent,
      TrainingRoomSettingsComponent
    ],
    exports: [
      TrainingRoomAverageComponent
    ],
    providers: []
  })
  export class TrainingRoomModule {}