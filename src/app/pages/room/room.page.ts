import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ScramblerService } from 'src/app/services/scrambler.service';

@Component({
  selector: 'app-room',
  templateUrl: './room.page.html',
  styleUrls: ['./room.page.scss'],
})
export class RoomPage {
  
  scramble: string;

  constructor(private scramblerService: ScramblerService) {
    this.scramble = scramblerService.getScramble();
  }

  updateScramble = () => this.scramble = this.scramblerService.getScramble();

  timeObtained = (time: number) => {
    this.updateScramble();
  }

}
