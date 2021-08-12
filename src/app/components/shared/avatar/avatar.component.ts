import { Component, Input, OnInit } from '@angular/core';
import { MomentumUser } from 'src/app/models/momentum-user.class';

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss'],
})
export class AvatarComponent implements OnInit {

  @Input() user: MomentumUser;
  @Input() uid: string;
  @Input() photoUrl: string;
  @Input() username: string;

  constructor() {
  }

  ngOnInit() {
    if (this.user) {
      this.uid = this.user.uid;
      this.photoUrl = this.user.photoUrl;
      this.username = this.user.username;
    }}

}