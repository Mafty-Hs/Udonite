import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';

import { AudioFile } from '@udonarium/core/file-storage/audio-file';
import { AudioStorage } from '@udonarium/core/file-storage/audio-storage';
import { AudioPlayer, VolumeType } from '@udonarium/core/file-storage/audio-player';
import { FileArchiver } from '@udonarium/core/file-storage/file-archiver';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { EventSystem, IONetwork } from '@udonarium/core/system';
import { Jukebox } from '@udonarium/Jukebox';

import { ModalService } from 'service/modal.service';
import { PanelService , PanelOption } from 'service/panel.service';
import { RoomService } from 'service/room.service';
import { StringUtil } from '@udonarium/core/system/util/string-util';
import { PlayerService } from 'service/player.service';
import { FileReaderUtil } from '@udonarium/core/file-storage/file-reader-util';
import { HelpComponent } from 'component/help/help.component';

@Component({
  selector: 'app-jukebox',
  templateUrl: './jukebox.component.html',
  styleUrls: ['./jukebox.component.css']
})
export class JukeboxComponent implements OnInit, OnDestroy {

  get volume(): number { return AudioPlayer.volume; }
  set volume(volume: number) { AudioPlayer.volume = volume; EventSystem.trigger('CHANGE_JUKEBOX_VOLUME', null); }

  get auditionVolume(): number { return AudioPlayer.auditionVolume; }
  set auditionVolume(auditionVolume: number) { AudioPlayer.auditionVolume = auditionVolume; EventSystem.trigger('CHANGE_JUKEBOX_VOLUME', null); }

  get seVolume(): number { return AudioPlayer.seVolume; }
  set seVolume(seVolume: number) { AudioPlayer.seVolume = seVolume; EventSystem.trigger('CHANGE_JUKEBOX_VOLUME', null); }


  get audios(): AudioFile[] {
    if (!this.selectedTag) {
      return AudioStorage.instance.audios
    }
    else if (this.selectedTag === '--notag--') {
      return AudioStorage.instance.audios.filter(audio => !Boolean(audio.tag));
    }
    else {
      return AudioStorage.instance.audios.filter(audio => audio.tag === this.selectedTag);
    }
  }
  get jukebox(): Jukebox { return ObjectStore.instance.get<Jukebox>('Jukebox'); }

  get percentAuditionVolume(): number { return Math.floor(AudioPlayer.auditionVolume * 100); }
  set percentAuditionVolume(percentAuditionVolume: number) { AudioPlayer.auditionVolume = percentAuditionVolume / 100; }

  get percentVolume(): number { return Math.floor(AudioPlayer.volume * 100); }
  set percentVolume(percentVolume: number) { AudioPlayer.volume = percentVolume / 100; }

  get percentSeVolume(): number { return Math.floor(AudioPlayer.seVolume * 100); }
  set percentSeVolume(percentVolume: number) { AudioPlayer.seVolume = percentVolume / 100; }

  get auditionIdentifier(): string {
    if ( this.auditionPlayer?.audio ) {
      return !this.auditionPlayer?.paused ? this.auditionPlayer.audio.identifier : ""
    }
    return ""
  }
  get jukeboxIdentifier(): string { return this.jukebox.audio ? this.jukebox.audio.identifier : ""}

  get auditionPlayerName(): string  { return this.auditionPlayer?.audio ?  this.auditionPlayer?.audio.name : ""}
  get jukeboxName(): string {  return this.jukebox.audio ? this.jukebox.audio.name : ""}

  _selectedTag:string = "";
  get selectedTag():string { return this._selectedTag}
  set selectedTag(tag :string) {
    this._selectedTag = tag;
    if (this.isEdit && tag !== '--notag--') this.editingTag = tag;
  }
  get taglist():string[] { return AudioStorage.instance.taglist }

  readonly auditionPlayer: AudioPlayer = new AudioPlayer();
  private lazyUpdateTimer: NodeJS.Timer = null;

  selectedAudioIdentifier:string = "";
  get selectedAudio():AudioFile {
    return AudioStorage.instance.get(this.selectedAudioIdentifier);
  }

  isEdit:boolean = false;
  toggleEdit(isUpdate:boolean = false) {
    if (isUpdate) {
      this.name = this.editingAudio.name;
      this.editingVolume = this.editingAudio.volume;
      this.editingTag = this.editingAudio.tag  === '--notag--' ? '' : this.editingAudio.tag ;
    }
    else {
      this.editingIdentifier = "";
      this.file = null;
      this.url = "";
      this.name = "";
      this.editingVolume = 100;
      this.editingTag = this.selectedTag;
    }
    this.isEdit = !this.isEdit;
  }

  editingIdentifier:string = "";
  get editingAudio() {
    return AudioStorage.instance.get(this.editingIdentifier);
  }

  saveEdit() {
    if (this.editingIdentifier) {
      this.editingAudio.name = this.name;
      this.editingAudio.volume = this.editingVolume;
      this.editingAudio.tag = this.editingTag;
      this.editingAudio.update();
    }
    else {
      if (this.fileType === 'url') {
        IONetwork.audioUrl(this.url , this.playerService.myPlayer.playerId ,this.name, 100,this.editingTag);
      }
      else {
        const file = this.file;
        const tag = this.editingTag;
        FileReaderUtil.calcSHA256Async(file).then(hash => {
          IONetwork.audioUpload(file ,file.type ,hash ,this.playerService.myPlayer.playerId,tag);
        })
      }
    }
    this.toggleEdit();
  }

  get canSave():boolean {
    if (this.fileType === 'url') {
      return Boolean(this.url && this.name);
    }
    else if (this.file && this.name) {
      return Boolean(((10 * 1024 * 1024) > this.file.size) && ((AudioStorage.instance.dataSize + this.file.size) < (IONetwork.server.audioStorageMaxSize *1024 *1024)))
    }
    return false
  }

  fileType:string = "local";
  name:string = "";
  editingVolume:number = 100;
  editingTag:string = "";
  file: File = null;
  url:string = "";

  constructor(
    private modalService: ModalService,
    private panelService: PanelService,
    private playerService: PlayerService,
    public roomService: RoomService,
    private ngZone: NgZone
  ) { }

  ngOnInit() {
    Promise.resolve().then(() => this.modalService.title = this.panelService.title = 'ジュークボックス');
    this.auditionPlayer.volumeType = VolumeType.AUDITION;
    EventSystem.register(this)
      .on('AUDIO_SYNC', event => {
        this.lazyNgZoneUpdate();
      });
  }

  ngOnDestroy() {
    EventSystem.unregister(this);
    this.stop();
  }

  selectCard(identifier :string) {
    if (this.selectedAudioIdentifier == identifier) {
      this.selectedAudioIdentifier = "";
      return;
    }
    this.editingIdentifier = identifier;
    this.selectedAudioIdentifier = identifier;
  }

  play() {
    this.auditionPlayer.play(this.selectedAudio);
    this.selectedAudioIdentifier = "";
  }

  stop() {
    this.auditionPlayer.stop();
  }

  playBGM() {
    this.jukebox.play(this.selectedAudioIdentifier, true);
    this.selectedAudioIdentifier = "";
  }

  stopBGM() {
    this.jukebox.stop();
  }

  playSE(identifier :string) {
    EventSystem.call('SOUND_EFFECT', this.selectedAudioIdentifier);
    this.selectedAudioIdentifier = "";
  }

  stopSE() {
    EventSystem.call('SE_STOP',null);
  }

  remove() {
    if (window.confirm("音楽を削除します。\nよろしいですか？")) {
      if (this.editingIdentifier === this.jukeboxIdentifier ) this.stopBGM();
      if (this.editingIdentifier === this.auditionIdentifier) this.stop();
      AudioStorage.instance.remove(this.editingIdentifier);

    }
    this.editingIdentifier = "";
    this.selectedAudioIdentifier = "";
    this.toggleEdit();
  }

  handleFileSelect(event: Event) {
    let input = <HTMLInputElement>event.target;
    let files = input.files;
    if (files.length) {
      this.file = files[0];
      this.name = this.file.name;
    }
  }

  help() {
    let option: PanelOption = { width: 800 , height: 600, left: 50, top: 100 };
    let component = this.panelService.open(HelpComponent,option);
    component.menu = "image";
  }

  private lazyNgZoneUpdate() {
    if (this.lazyUpdateTimer !== null) return;
    this.lazyUpdateTimer = setTimeout(() => {
      this.lazyUpdateTimer = null;
      this.ngZone.run(() => { });
    }, 100);
  }
}
