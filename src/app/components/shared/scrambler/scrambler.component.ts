import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { ScramblerService } from 'src/app/services/scrambler.service';

@Component({
  selector: 'app-scrambler',
  templateUrl: './scrambler.component.html',
  styleUrls: ['./scrambler.component.scss'],
})
export class ScramblerComponent implements OnInit {

  @Input() scrambles: string[];
  @Output() lastScramble: EventEmitter<void> = new EventEmitter();
  
  scramble: string;
  index = 0;

  constructor(private scramblerService: ScramblerService) { }

  ngOnInit() {
    this.scramble = this.scrambles ? this.scrambles[this.index] : this.scramblerService.getScramble();
  }

  updateScramble = () => this.scramble = this.scramblerService.getScramble();

  getNextScramble = () => {
    if (this.index + 1 < this.scrambles.length) {
      this.index++;
      this.scramble = this.scrambles[this.index];
    } else {
      this.lastScramble.emit();
    }
  }

}
