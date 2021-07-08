import { AfterViewInit, Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { GestureController } from '@ionic/angular';

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss'],
})
export class TimerComponent implements AfterViewInit {
  
  @Output() timeObtained = new EventEmitter();
  @ViewChild('timer', { read: ElementRef }) timer: ElementRef;
  time: number;
  displayTime: number;
  pressed: boolean;
  ready: boolean;
  hold: boolean;
  finished: boolean;
  running: boolean;
  timeInterval: any;
  holdTimeOut: any;

  constructor(private gestureCtrl: GestureController) {
    this.initTimer();
    this.finished = false;
  }

  initTimer = () => {
    clearTimeout(this.holdTimeOut);
    if (!this.running) {
      this.time = 0;
      this.displayTime = 0;
    } else {
      this.displayTime = this.time;
      this.timeObtained.emit(this.getDisplayTime());
    }
    this.ready = true;
    this.pressed = false;
    this.hold = false;
    this.running = false;
  }

  ngOnInit() {}

  ngAfterViewInit() {
    const longPress = this.gestureCtrl.create({
      el: this.timer.nativeElement,
      threshold: 0,
      gestureName: 'long-press',
      onStart: ev => {
        if (this.running) {
          this.finished = true;
          clearInterval(this.timeInterval);
          this.initTimer();
        } else {
          this.pressed = true;
          this.checkHoldingTime();
        }
      },
      onEnd: ev => {
        this.pressed = false;
        if (this.hold) {
          this.startTimer();
        } else {
          clearInterval(this.timeInterval);
          this.holdTimeOut = undefined
        }
      }
    }, true);

    longPress.enable();
  }

  checkHoldingTime = (timeOut = 400) => {
    console.log(this.holdTimeOut);
    if (this.holdTimeOut === undefined) {
      this.holdTimeOut = setTimeout(() => {
        if (this.pressed) {
          this.hold = true;
          this.time = 0;
          this.displayTime = 0;
        }
      }, timeOut);
    }
  }

  startTimer = (increase: number = 10) => {
    this.running = true;
    this.timeInterval = setInterval(() => {
      this.time += increase
      if (this.time % 30 === 0) {
        this.displayTime = this.time;
      }
    }, increase);
  }

  getDisplayTime = () => Number(this.displayTime / 1000).toFixed(2)

  getColor = () => {
    if (this.hold) {
      return "success";
    } else if (this.pressed) {
      return "danger";
    } else if (this.ready) {
      return "dark";
    }
  }

}
