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
export class RoomService {

  $session = new ReplaySubject<Session>(1);
  room: Room;
  session: Session;
  category: Category;

  activeSessionId: number;
  activeCategoryId: number;

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
    this.activeCategoryId = this.session.activeCategoryId;
    this.category = this.session.categories.find(category => category.id === this.activeCategoryId);
    this.$session.next(this.session);
  }

  initRecord = (): Record => {
    let id = this.category.records.length > 0 ? this.getLastRecord().id + 1 : 0;
    return new Record(id);
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
      this.category.records[index] = record;
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
      currentRecords = currentRecords.map(record => {
        record.partOfAverage = !!averageRecords.find((_record) => record.id === _record.id);
        return record;
      });
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
    return null;
  }

  deleteAverage = (range: number) => {
    this.category.averages = this.category.averages.filter(average => average.range !== range);
    this.persistRoomChanges();   
  }

}
