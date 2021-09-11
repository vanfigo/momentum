import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ScramblerService {
  
  turnTypes = "'2 ";
  turns = "UDFBRL";

  constructor() { }

  getScramble = (turns: number = 19) => {
    let scramble = [];
    let currentTurn = '';
    for(let i = 0; i < turns; i ++) {
        currentTurn = this.pickTurn(currentTurn);
        let currentTurnType = this.turnTypes[this.getRandomNumber(0,3)];
        scramble.push(currentTurn + (currentTurnType === ' ' ? '' : currentTurnType));
    }
    return scramble.join(' ');
  }

  pickTurn = (lastTurn: string) => {
    let nextTurn = this.turns[this.getRandomNumber(0,6)];
    if (nextTurn === lastTurn) {
        return this.pickTurn(lastTurn);
    }
    return nextTurn;
  }

  getRandomNumber = (min: number, max: number) => Math.floor(Math.random() * max) + min;

}
