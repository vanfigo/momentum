/* eslint-disable no-invalid-this, require-jsdoc */
export class Scrambler {
  
  turnTypes = "'2 ";
  turns = "UDFBRL";

  getPlayableScrambles = (scramblesNumber = 5): string[] => {
    const scrambles: string[] = [];
    for (let i = 0; i < scramblesNumber; i++) {
      scrambles.push(this.getScramble());
    }
    return scrambles;
  }

  getScramble = (turns = 19): string => {
    const scramble = [];
    let currentTurn = "";
    for (let i = 0; i < turns; i++) {
      currentTurn = this.pickTurn(currentTurn);
      const currentTurnType = this.turnTypes[this.getRandomNumber(0, 3)];
      scramble.push(
          currentTurn + (currentTurnType === " " ? "" : currentTurnType));
    }
    return scramble.join(" ");
  }

  pickTurn = (lastTurn: string): string => {
    const nextTurn = this.turns[this.getRandomNumber(0, 6)];
    if (nextTurn === lastTurn) {
      return this.pickTurn(lastTurn);
    }
    return nextTurn;
  }

  getRandomNumber = (min: number, max: number): number =>
    Math.floor(Math.random() * max) + min;
}
