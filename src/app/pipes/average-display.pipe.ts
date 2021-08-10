import { Pipe, PipeTransform } from '@angular/core';
import { Average } from '../models/average.class';

@Pipe({
  name: 'averageDisplay'
})
export class AverageDisplayPipe implements PipeTransform {

  transform(average: Average, best?: boolean): string {
    let time: number;
    if (best) {
      if (average.bestDNF) {
        return 'DNF';
      } else {
        time = average.bestTime;
      }
    } else {
      if (average.currentDNF) {
        return 'DNF';
      } else {
        time = average.currentTime;
      }
    }
    if (time === null) {
      return '--:--';
    }
    const elapsedTime = time / 1000;
    const min = Math.trunc(elapsedTime / 60);
    const sec = Math.trunc(elapsedTime % 60);
    const mil = Math.trunc(time % 1000 / 10);
    
    return `${(min > 0 ? min + ':' : '')}${sec.toString().padStart(2, '0')}.${mil.toString().padStart(2, '0')}s`;
  }

}
