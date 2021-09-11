import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { Upload } from '../models/upload.class';
import { AuthService } from './shared/auth.service';

@Injectable({
  providedIn: 'root'
})
export class UploadService {

  constructor(private storageSvc: AngularFireStorage,
              private authSvc: AuthService) { }

  upload = (upload: Upload, path?: string) => {
    path = path || '/images';
    return this.storageSvc.ref(`${path}/${this.authSvc.user.uid}`).child(upload.name).put(upload.file);
  }
}
