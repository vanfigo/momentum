import { Component, OnInit } from '@angular/core';
import { ScramblerService } from 'src/app/services/scrambler.service';

@Component({
  selector: 'app-scrambler',
  templateUrl: './scrambler.component.html',
  styleUrls: ['./scrambler.component.scss'],
})
export class ScramblerComponent implements OnInit {

  scramble: string;

  constructor(private scramblerService: ScramblerService) {
    this.scramble = scramblerService.getScramble();
  }

  ngOnInit() {}

  updateScramble = () => this.scramble = this.scramblerService.getScramble();

}
