import { Component, OnDestroy, OnInit, Input ,Output ,EventEmitter } from '@angular/core';

import { EventSystem, Network } from '@udonarium/core/system';
import { PeerContext } from '@udonarium/core/system/network/peer-context';
import { RoomService, RoomState } from 'service/room.service';

@Component({
  selector: 'password-check',
  templateUrl: './password-check.component.html',
  styleUrls: ['./password-check.component.css']
})
export class PasswordCheckComponent implements OnInit, OnDestroy {
  password: string = '';
  help: string = '';
  @Input() roomId: PeerContext[];
  get room():PeerContext {return this.roomId[0];}

  title: string = '';

  get peerId(): string { return Network.peerId; }
  get isConnected(): boolean {
    return Network.peerIds.length <= 1 ? false : true;
  }

  constructor(
    private roomService: RoomService,
  ) {
  }

  ngOnInit() {
    EventSystem.register(this);
  }

  ngOnDestroy() {
    EventSystem.unregister(this);
  }

  cancel() {
    this.roomService.roomState = RoomState.LOBBY
  }

  onInputChange(value: string) {
    this.help = '';
  }

  submit() {
    if (!this.room.verifyPassword(this.password)) {
      this.help = 'パスワードが違います';
      return;
    }
    this.roomService.connect(this.roomId,this.password);
  }
}
