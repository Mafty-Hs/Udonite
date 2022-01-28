import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';

import { AudioFile } from '@udonarium/core/file-storage/audio-file';
import { AudioStorage } from '@udonarium/core/file-storage/audio-storage';
import { AudioPlayer, VolumeType } from '@udonarium/core/file-storage/audio-player';
import { FileArchiver } from '@udonarium/core/file-storage/file-archiver';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { EventSystem } from '@udonarium/core/system';
import { Jukebox } from '@udonarium/Jukebox';

import { ModalService } from 'service/modal.service';
import { PanelService } from 'service/panel.service';
import { RoomService } from 'service/room.service';

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

  get audios(): AudioFile[] { return AudioStorage.instance.audios }
  get jukebox(): Jukebox { return ObjectStore.instance.get<Jukebox>('Jukebox'); }

  get percentAuditionVolume(): number { return Math.floor(AudioPlayer.auditionVolume * 100); }
  set percentAuditionVolume(percentAuditionVolume: number) { AudioPlayer.auditionVolume = percentAuditionVolume / 100; }

  get percentVolume(): number { return Math.floor(AudioPlayer.volume * 100); }
  set percentVolume(percentVolume: number) { AudioPlayer.volume = percentVolume / 100; }

  get auditionIdentifier(): string { 
    if ( this.auditionPlayer?.audio ) {
      return !this.auditionPlayer?.paused ? this.auditionPlayer.audio.identifier : ""
    }
    return ""
  }
  get jukeboxIdentifier(): string { return this.jukebox.audio ? this.jukebox.audio.identifier : ""}
  get effectIdentifier(): string { return this.jukebox.se ? this.jukebox.se.identifier : ""}

  get auditionPlayerName(): string  { return this.auditionPlayer?.audio ?  this.auditionPlayer?.audio.name : ""}
  get jukeboxName(): string {  return this.jukebox.audio ? this.jukebox.audio.name : ""}

  readonly auditionPlayer: AudioPlayer = new AudioPlayer();
  private lazyUpdateTimer: NodeJS.Timer = null;

  nameIdentifier:string = "";
  get nameAudio():AudioFile {
    return AudioStorage.instance.get(this.nameIdentifier);
  }

  constructor(
    private modalService: ModalService,
    private panelService: PanelService,
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

  toggleName(e: Event,identifier :string) {
    if (identifier !== this.nameIdentifier) this.nameIdentifier = identifier; 
    e.stopPropagation();
    e.preventDefault();
  }

  play(identifier :string) {
    if (identifier === this.auditionIdentifier) {
      this.stop();
      return;
    }
    this.auditionPlayer.play(AudioStorage.instance.get(identifier));
  }

  stop() {
    console.log(this.auditionIdentifier);
    this.auditionPlayer.stop();
  }

  playBGM(identifier :string) {
    if (identifier === this.jukeboxIdentifier) {
      this.stopBGM();
      return;
    }
    this.jukebox.play(identifier, true);
  }

  stopBGM() {
    this.jukebox.stop();
  }

  playSE(identifier :string) {
    if (identifier === this.effectIdentifier) {
      this.stopSE();
      return;
    }
    this.jukebox.sePlay(identifier, false);
  }

  stopSE() {
    this.jukebox.seStop();
  }

  remove(identifier :string) {
    if (window.confirm("選択した音楽を削除します。\nよろしいですか？")) {
      AudioStorage.instance.destroy(identifier); 
    }
  }

  handleFileSelect(event: Event) {
    let input = <HTMLInputElement>event.target;
    let files = input.files;
    if (files.length) FileArchiver.instance.load(files);
    input.value = '';
  }

  private lazyNgZoneUpdate() {
    if (this.lazyUpdateTimer !== null) return;
    this.lazyUpdateTimer = setTimeout(() => {
      this.lazyUpdateTimer = null;
      this.ngZone.run(() => { });
    }, 100);
  }
}
