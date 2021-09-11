import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { ScramblerService } from 'src/app/services/shared/scrambler.service';

@Component({
  selector: 'app-scrambler',
  templateUrl: './scrambler.component.html',
  styleUrls: ['./scrambler.component.scss'],
})
export class ScramblerComponent implements OnInit {

  @Input() scrambles: string[];
  @Input() allowRefresh: boolean = true;
  @Input() waitingForScramble: boolean = false;
  @Output() lastScramble: EventEmitter<void> = new EventEmitter();
  @Output() currentScramble: EventEmitter<string> = new EventEmitter();
  
  scramble: string;
  index = 0;

  constructor(private scramblerService: ScramblerService) { }

  ngOnInit() {
    this.scramble = this.scrambles ? this.scrambles[this.index] : this.updateScramble();
  }

  setScramble = (scramble: string) => {
    this.scramble = scramble;
    this.waitingForScramble = false;
  }

  updateScramble = () => {
    this.scramble = this.scramblerService.getScramble();
    this.currentScramble.emit(this.scramble);
    return this.scramble;
  };

  getNextScramble = () => {
    if (this.index + 1 < this.scrambles.length) {
      this.index++;
      this.scramble = this.scrambles[this.index];
    } else {
      this.lastScramble.emit();
    }
  }

}
