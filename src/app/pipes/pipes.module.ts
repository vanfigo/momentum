import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecordDisplayPipe } from './record-display.pipe';
import { AverageDisplayPipe } from './average-display.pipe';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [RecordDisplayPipe, AverageDisplayPipe],
  exports: [RecordDisplayPipe, AverageDisplayPipe]
})
export class PipesModule { }
