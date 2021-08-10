import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeDisplay'
})
export class TimeDisplayPipe implements PipeTransform {

  transform(time: number): string {
    if (time === undefined) {
      return '--:--';
    }
    if (time === null) {
      return 'DNF';
    }
    const elapsedTime = time / 1000;
    const min = Math.trunc(elapsedTime / 60);
    const sec = Math.trunc(elapsedTime % 60);
    const mil = Math.trunc(time % 1000 / 10);
    
    return `${(min > 0 ? min + ':' : '')}${sec.toString().padStart(2, '0')}.${mil.toString().padStart(2, '0')}s`;
  }

}
