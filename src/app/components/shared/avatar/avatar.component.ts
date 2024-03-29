import { Component, Input, OnInit } from '@angular/core';
import { MomentumUser } from 'src/app/models/momentum-user.class';
import { Player } from 'src/app/models/player.class';

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss'],
})
export class AvatarComponent implements OnInit {

  @Input() user: MomentumUser | Player;
  @Input() uid: string;
  @Input() photoURL: string;
  @Input() username: string;
  @Input() disabled: boolean = false;

  constructor() {
  }

  ngOnInit() {
    if (this.user) {
      this.uid = this.user.uid;
      this.photoURL = this.user.photoURL;
      this.username = this.user.username;
    }
  }

  showProfile = () => {}

}
