import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TimerComponent  } from './timer/timer.component';
import { IonicModule } from '@ionic/angular';
import { HistoryComponent } from './history/history.component';
import { ScramblerComponent } from './scrambler/scrambler.component';
import { TrainingRoomAverageComponent } from './training-room-average/training-room-average.component';
import { RecordDisplayPipe } from '../pipes/record-display.pipe';
import { RecordChipComponent } from './record-chip/record-chip.component';
import { FormsModule } from '@angular/forms';
import { AverageChipComponent } from './average-chip/average-chip.component';
import { PipesModule } from '../pipes/pipes.module';
import { AverageDisplayPipe } from '../pipes/average-display.pipe';
import { TrainingRoomSettingsComponent } from './training-room-settings/training-room-settings.component';

@NgModule({
    imports: [
      CommonModule,
      IonicModule,
      FormsModule,
      PipesModule
    ],
    declarations: [
      TimerComponent,
      HistoryComponent,
      ScramblerComponent,
      TrainingRoomAverageComponent,
      RecordChipComponent,
      AverageChipComponent,
      TrainingRoomSettingsComponent
    ],
    exports: [
      ScramblerComponent,
      TimerComponent,
      TrainingRoomAverageComponent
    ],
    providers: [RecordDisplayPipe, AverageDisplayPipe, DatePipe]
  })
  export class TrainingRoomModule {}