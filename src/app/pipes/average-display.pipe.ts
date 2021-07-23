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
    let elapsedTime = time / 1000;
    let min = Math.trunc(elapsedTime / 60);
    let sec = elapsedTime % 60;
    return `${(min > 0 ? min + ':' : '')}${Number(sec).toFixed(2).padStart(5, '0')}s`;
  }

}
