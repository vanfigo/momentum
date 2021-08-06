import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeDisplay'
})
export class TimeDisplayPipe implements PipeTransform {

  transform(time: number): string {
    if (time === null) {
      return 'DNF';
    }
    let elapsedTime = time / 1000;
    let min = Math.trunc(elapsedTime / 60);
    let sec = elapsedTime % 60;
    return `${(min > 0 ? min + ':' : '')}${Number(sec).toFixed(2).padStart(5, '0')}s`;
  }

}
