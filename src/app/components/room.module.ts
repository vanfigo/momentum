import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TimerComponent  } from './timer/timer.component';
import { IonicModule } from '@ionic/angular';
import { HistoryComponent } from './history/history.component';
import { ScramblerComponent } from './scrambler/scrambler.component';
import { AverageComponent } from './average/average.component';
import { TimeDisplayPipe } from '../pipes/time-display.pipe';
import { TimeChipComponent } from './time-chip/time-chip.component';
import { FormsModule } from '@angular/forms';

@NgModule({
    imports: [
      CommonModule,
      IonicModule,
      FormsModule
    ],
    declarations: [
      TimerComponent,
      HistoryComponent,
      ScramblerComponent,
      AverageComponent,
      TimeChipComponent,
      TimeDisplayPipe
    ],
    exports: [
      TimerComponent,
      HistoryComponent,
      ScramblerComponent,
      AverageComponent,
      TimeChipComponent,
      TimeDisplayPipe
    ],
    providers: [TimeDisplayPipe, DatePipe]
  })
  export class RoomModule {}