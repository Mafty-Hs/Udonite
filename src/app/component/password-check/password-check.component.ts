import { Component, OnDestroy, OnInit, Input ,Output ,EventEmitter } from '@angular/core';
import { RoomList } from '@udonarium/core/system/socketio/netowrkContext';
import { RoomService, RoomState } from 'service/room.service';

@Component({
  selector: 'password-check',
  templateUrl: './password-check.component.html',
  styleUrls: ['./password-check.component.css']
})
export class PasswordCheckComponent implements OnInit, OnDestroy {
  help: string = '';
  @Input() room: RoomList;
  @Input() deleteMode: boolean = false;
  @Output() deleteModeChange:EventEmitter<boolean> = new EventEmitter();
  inputPassword:string;

  title: string = '';

  constructor(
    private roomService: RoomService,
  ) {
  }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

  cancel() {
    this.roomService.roomState = RoomState.LOBBY
  }

  onInputChange(value: string) {
    this.help = '';
  }

  submit() {
    if (this.room.password != this.inputPassword) {
      this.help = 'パスワードが違います';
      return;
    }
    if (this.deleteMode) {this.roomService.delete(this.room.roomId,this.room.password); this.deleteModeChange.emit(false);}
    else this.roomService.connect(this.room.roomId,this.room.password);
  }
}
