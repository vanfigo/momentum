import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { Average } from '../models/average.class';
import { Category } from '../models/category.class';
import { Record } from '../models/record.class';
import { Room } from '../models/room.class';
import { Session } from '../models/session.class';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class TrainingRoomService {

  $session = new ReplaySubject<Session>(1);
  room: Room;
  session: Session;
  category: Category;

  activeSessionId: number;
  activeCategoryType: string;

  constructor(private storageService: StorageService) {
    storageService.get('room').then((room: Room) => {
      if (room === null) {
        room = new Room();
        this.storageService.set('room', room).then(() => this.initRoom(room));
      } else {
        this.initRoom(room);
      }
    });
  }

  initRoom = (room: Room) => {
    this.room = room;
    this.activeSessionId = room.activeSessionId;
    this.session = room.sessions.find(session => session.id === room.activeSessionId);
    this.activeCategoryType = this.session.activeCategoryType;
    this.category = this.session.categories.find(category => category.categoryType === this.activeCategoryType);
    this.$session.next(this.session);
  }

  addSession = (sessionName: string) => {
    let sessionsLength = this.room.sessions.length;
    let session = new Session(this.room.sessions[sessionsLength - 1].id + 1, sessionName);
    this.room.sessions.push(session);
    this.room.activeSessionId = session.id;
    this.storageService.set('room', this.room).then(() => this.initRoom(this.room));
  }

  editSession = (sessionId: number, sessionName: string) => {
    let session = this.room.sessions.find(session => session.id === sessionId);
    session.name = sessionName;
    let index = this.room.sessions.indexOf(session);
    this.room.sessions[index] = session;
    this.storageService.set('room', this.room).then(() => this.initRoom(this.room));
  }

  deleteSession = (sessionId: number) => {
    this.room.sessions = this.room.sessions.filter(session => session.id !== sessionId);
    if (this.activeSessionId === sessionId) {
      this.activeSessionId = this.room.sessions[0].id;
    }
    this.storageService.set('room', this.room).then(() => this.initRoom(this.room));
  }

  selectSession = (activeSessionId: number) => {
    this.room.activeSessionId = activeSessionId;
    this.storageService.set('room', this.room).then(() => this.initRoom(this.room));
  }

  getRecordsOrderByCreation = (order: boolean = false): Record[] => order ?
    JSON.parse(JSON.stringify(this.category.records.slice().sort((a, b) => a.creation - b.creation))) :
    JSON.parse(JSON.stringify(this.category.records.slice().sort((a, b) => b.creation - a.creation)));

  getRecordsOrderByTime = (order: boolean = true): Record[] => order ?
    JSON.parse(JSON.stringify(this.category.records.slice().sort((a, b) => a.time - b.time))) :
    JSON.parse(JSON.stringify(this.category.records.slice().sort((a, b) => b.time - a.time)));

  getAveragesOrderByRange = (order: boolean = true): Average[] => order ?
    JSON.parse(JSON.stringify(this.category.averages.slice().sort((a, b) => a.range - b.range))) :
    JSON.parse(JSON.stringify(this.category.averages.slice().sort((a, b) => b.range - a.range)))

  getLastRecord = () => this.getRecordsOrderByCreation()[0];

  getBestRecordByTime = () => this.getRecordsOrderByTime()[0];
  
  addRecord(record: Record) {
    let id = this.category.records.length > 0 ? this.getLastRecord().id + 1 : 0;
    record.id = id
    this.category.records.push(record);
    this.updateAverages();
    this.persistRoomChanges();
  }

  deleteRecord(record: Record) {
    this.category.records = this.category.records.filter(_record => _record.id !== record.id);
    this.updateAverages();
    this.persistRoomChanges();    
  }
  
  updateRecord(record: Record) {
    let recordFound = this.category.records.find(_record => _record.id === record.id);
    if (recordFound) {
      let index = this.category.records.indexOf(recordFound);
      this.category.records[index] = {...record, partOfAverage: true};
      this.updateAverages();
      this.persistRoomChanges();
    }
  }

  persistRoomChanges = () => {
    let categoryIndex = this.session.categories.indexOf(this.category);
    this.session.categories[categoryIndex] = this.category;
    let sessionIndex = this.room.sessions.indexOf(this.session);
    this.room.sessions[sessionIndex] = this.session;
    this.storageService.set('room', this.room).then(() => this.initRoom(this.room));
  }

  addAverage = (range: number) => {
    let average = this.category.averages.find(_average => _average.range === range);
    if (average === undefined) {
      average = this.getAverageOf(range);
      this.category.averages.push(average);
      this.persistRoomChanges();
    }
  }

  updateAverages = () => { this.category.averages = this.category.averages.map((average: Average) => this.getAverageOf(average.range)); }

  getAverageOf = (range: number): Average => {
    let recordsLength = this.category.records.length;
    if (recordsLength >= range) {
      // Calculates current average of (range)
      let currentRecords = this.getRecordsOrderByCreation().slice(0, range);
      let { time, averageRecords } = this.calculateAverage(currentRecords, range);
      if (time !== null) {
        currentRecords = currentRecords.map(record => {
          record.partOfAverage = !!averageRecords.find((_record) => record.id === _record.id);
          return record;
        });
      } else {
        currentRecords = currentRecords.map(record => {
          record.dnf ? record.partOfAverage = false : record.partOfAverage = true;
          return record;
        });
      }
      let bestTime: number = null;
      let bestRecords: Record[];
      let index = 0;
      // Calculates best average of (range)
      while (index + range <= recordsLength) {
        let newBestRecords = this.getRecordsOrderByCreation().slice(index, index + range);
        let { time, averageRecords } = this.calculateAverage(newBestRecords, range);
        if (time !== null) {
          if (bestTime === null) {
            bestTime = time;
            bestRecords = newBestRecords.map(record => {
              record.partOfAverage = !!averageRecords.find((_record) => record.id === _record.id);
              return record;
            });
          } else if (time < bestTime) {
            bestTime = time;
            bestRecords = newBestRecords.map(record => {
              record.partOfAverage = !!averageRecords.find((_record) => record.id === _record.id);
              return record;
            });
          }
        }  else if (bestTime === null) {
          bestRecords = newBestRecords.map(record => {
            record.dnf ? record.partOfAverage = false : record.partOfAverage = true;
            return record;
          });
        }
        index++;
      }
      return { range, currentTime: time, currentRecords, bestTime, bestRecords, currentDNF: time === null, bestDNF: bestTime === null };
    };
    return new Average(range);
  }

  calculateAverage = (records: Record[], range?: number): {time: number, averageRecords: Record[]} => {
    range = range || records.length;
    let trim = range < 20 ? 1 : Math.trunc(range * 0.05);
    let dnfRecords = records.reduce((prev, currentRecord) => currentRecord.dnf ? ++prev : prev, 0);
    if (dnfRecords <= trim) {
      let filteredRecords = records.filter(record => !record.dnf).sort((a, b) => a.time - b.time);
      let averageRecords = filteredRecords.slice(trim, dnfRecords === trim ? filteredRecords.length : dnfRecords - trim);
      return {time: averageRecords.reduce((prev, record) => prev + record.time, 0) / averageRecords.length, averageRecords};
    }
    return {time: null, averageRecords: []};
  }

  deleteAverage = (range: number) => {
    this.category.averages = this.category.averages.filter(average => average.range !== range);
    this.persistRoomChanges();   
  }

}
