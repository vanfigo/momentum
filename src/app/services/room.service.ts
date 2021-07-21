import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';
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

  // getRecordsOrderById = () => this.category.records.sort((a, b) => a.id - b.id);

  getRecordsOrderByCreation = () => this.category.records.sort((a, b) => b.creation - a.creation);

  getRecordsOrderByTime = () => this.category.records.sort((a, b) => a.time - b.time);

  getLastRecord = () => this.getRecordsOrderByCreation()[0];

  getBestRecordByTime = () => this.getRecordsOrderByTime()[0];
  
  addTimeToCurrentCategory(record: Record) {
    this.category.records.push(record);
    this.persistRoomChanges();
  }

  deleteRecordFromCurrentCategory(record: Record) {
    this.category.records = this.category.records.filter(_record => _record.id !== record.id);
    this.persistRoomChanges();    
  }
  updateRecordFromCurrentCategory(record: Record) {
    let recordFound = this.category.records.find(_record => _record.id === record.id);
    if (recordFound) {
      let index = this.category.records.indexOf(recordFound);
      this.category.records[index] = record;
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

}
