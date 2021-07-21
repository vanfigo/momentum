import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { AlertController, GestureController } from '@ionic/angular';
import { Record } from 'src/app/models/record.class';
import { TimeDisplayPipe } from 'src/app/pipes/time-display.pipe';
import { RoomService } from 'src/app/services/room.service';

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss'],
})
export class TimerComponent implements AfterViewInit {

  @ViewChild('timerDisplay', {read: ElementRef}) timerDisplay: ElementRef;
  @ViewChild('inspectionDisplay', {read: ElementRef}) inspectionDisplay: ElementRef;
  @Output() recordObtained: EventEmitter<Record> = new EventEmitter();
  @Output() recordUpdated: EventEmitter<Record> = new EventEmitter();
  @Output() recordDeleted: EventEmitter<Record> = new EventEmitter();

  record: Record;
  inspection: boolean;
  inspectionTime: number = 0;
  dnf: boolean;
  plus: boolean;
  editable: boolean;

  ready: boolean;
  pressed: boolean;
  onHold: boolean;
  onInspection: boolean;
  running: boolean;

  timerInterval: any;
  timerTimeOut: any;
  inspectionInterval: any;

  constructor(private roomSvc: RoomService,
              private gestureCtrl: GestureController,
              private changeDetector: ChangeDetectorRef,
              private alertCtrl: AlertController,
              private timeDisplayPipe: TimeDisplayPipe) {
    this.ready = true;
    this.pressed = false;
    this.onHold = false;
    this.onInspection = false;
    this.running = false;
    this.dnf = false;
    this.plus = false;
    this.editable = false;
  }

  ngAfterViewInit(): void {
    this.addTimerGesture();
  }

  addInspectionGesture = () => {
    this.inspectionInterval = setInterval(() => {
      this.inspectionTime++
      if (this.inspectionTime === 15) {
        this.plus = true;
      } else if (this.inspectionTime === 17) {
        this.plus = false;
        this.dnf = true;
      }
    }, 1000);
    this.gestureCtrl.create({
      el: this.inspectionDisplay.nativeElement,
      threshold: 0,
      gestureName: 'inspection-press',
      onStart: () => {
        this.pressed = true;
        // Main difference only when running
        if (!this.running) { // start the timeOut to validate holding
          this.timerTimeOut = setTimeout(() => {
            this.onHold = true;
          }, 400);
        }
      },
      onEnd: () => {
        this.pressed = false;
        // Main difference only when on hold
        if (this.onHold) {
          this.onHold = false;
          this.ready = false;
          // stop inspection time
          clearInterval(this.inspectionInterval);
          this.inspectionTime = 0;
          this.onInspection = false;
          this.running = true;
          // change back to timer
          this.changeDetector.detectChanges();
          this.addTimerGesture();
          this.timerInterval = setInterval(() => this.record.time += 10, 10);
        } else { // clear the timeout which validates onHold
          clearTimeout(this.timerTimeOut);
        }
      }
    }, true).enable();
  }

  addTimerGesture = () => {
    this.gestureCtrl.create({
      el: this.timerDisplay.nativeElement,
      threshold: 0,
      gestureName: 'timer-press',
      onStart: () => {
        this.pressed = true;
        // Main difference only when running
        if (this.running) { // stop the timer
          this.finishRecord();
        } else { // start the timeOut to validate holding
          this.timerTimeOut = setTimeout(() => {
            this.onHold = true;
            this.dnf = false;
            this.plus = false;
            this.editable = false;
            this.record = this.roomSvc.initRecord();
          }, 400);
        }
      },
      onEnd: () => {
        this.pressed = false;
        // Main difference only when on hold
        if (this.onHold) {
          this.onHold = false;
          this.ready = false;
          // chceck if it is set to inspect
          if (this.inspection) {
            this.onInspection = true;
            this.changeDetector.detectChanges();
            this.addInspectionGesture();
          } else { // start the timer
            this.running = true;
            this.timerInterval = setInterval(() => this.record.time += 10, 10);
          }
        } else { // clear the timeout which validates onHold
          clearTimeout(this.timerTimeOut);
        }
      }
    }, true).enable();
  }

  finishRecord = () => {
    this.ready = true;
    this.running = false;
    clearInterval(this.timerInterval);
    if (this.plus) {
      this.record.time += 2000;
    }
    this.record.creation = new Date().getTime();
    this.record.dnf = this.dnf;
    this.record.plus = this.plus;
    this.recordObtained.emit(this.record);
  }

  deleteRecord = () => {
    if (this.record) {
      this.alertCtrl.create({
        header: 'Borrar tiempo',
        message: `En realidad quieres borrar el tiempo de ${this.timeDisplayPipe.transform(this.record)}`,
        buttons: ['Cancelar', {
          text: 'Borrar',
          handler: () => {
            this.recordDeleted.emit(this.record);
            this.record = undefined;
          }
        }]
      }).then(alert => alert.present());
    }
  }

  updatePlusRecord = (plus: boolean) => {
    if (this.record) {
      this.editable = true;
      this.plus = plus;
      this.record.plus = plus;
      plus ? this.record.time += 2000 : this.record.time -= 2000;
      this.recordUpdated.emit(this.record);
    }
  }

  updateDNFRecord = (dnf: boolean) => {
    if (this.record) {
      if (dnf && this.plus) {
        this.plus = false;
        this.record.plus = false;
        this.record.time -= 2000;
      }
      this.editable = true;
      this.dnf = dnf;
      this.record.dnf = dnf;
      this.recordUpdated.emit(this.record);
    }
  }

  getColor = () => {
    if (this.onHold) {
      return "success";
    } else if (this.pressed) {
      return "danger";
    } else if (this.ready) {
      return "dark";
    }
  }

  getInspectionColor = () => {
    if (this.onHold) {
      return "success";
    } else if (this.pressed) {
      return "danger";
    } else if (this.inspectionTime >= 12) {
      return "tertiary";
    } else if (this.inspectionTime >= 8) {
      return "warning";
    }
  }

}
