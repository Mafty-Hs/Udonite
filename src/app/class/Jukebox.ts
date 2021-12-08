import { AudioFile } from './core/file-storage/audio-file';
import { AudioPlayer, VolumeType } from './core/file-storage/audio-player';
import { AudioStorage } from './core/file-storage/audio-storage';
import { AudioInfo , AudioSetting } from '@udonarium/audio-setting';
import { SyncObject, SyncVar } from './core/synchronize-object/decorator';
import { GameObject, ObjectContext } from './core/synchronize-object/game-object';
import { EventSystem } from './core/system';

@SyncObject('jukebox')
export class Jukebox extends GameObject {
  @SyncVar() audioIdentifier: string = '';
  @SyncVar() startTime: number = 0;
  @SyncVar() isLoop: boolean = false;
  @SyncVar() isPlaying: boolean = false;
  @SyncVar() seIdentifier: string = '';
  @SyncVar() seStartTime: number = 0;
  @SyncVar() seIsLoop: boolean = false;
  @SyncVar() seIsPlaying: boolean = false;

  get audio(): AudioFile { return AudioStorage.instance.get(this.audioIdentifier); }
  get se(): AudioFile { return AudioStorage.instance.get(this.seIdentifier); }
  private audioPlayer: AudioPlayer = new AudioPlayer();
  private sePlayer: AudioPlayer = new AudioPlayer();

  seInit() {
    this.sePlayer.volumeType = VolumeType.SE;
  }

  // GameObject Lifecycle
  onStoreAdded() {
    super.onStoreAdded();
    this.unlockAfterUserInteraction();
  }

  // GameObject Lifecycle
  onStoreRemoved() {
    super.onStoreRemoved();
    this._stop();
  }

  play(identifier: string, isLoop: boolean = false) {
    let audio = AudioStorage.instance.get(identifier);
    if (!audio || !audio.isReady) return;
    this.audioIdentifier = identifier;
    this.isPlaying = true;
    this.isLoop = isLoop;
    this._play();
  }

  sePlay(identifier: string, isLoop: boolean = false) {
    let audio = AudioStorage.instance.get(identifier);
    if (!audio || !audio.isReady) return;
    this.seIdentifier = identifier;
    this.seIsPlaying = true;
    this.seIsLoop = isLoop;
    this._sePlay();
  }

  private _play() {
    this._stop();
    if (!this.audio || !this.audio.isReady) {
      this.playAfterFileUpdate();
      return;
    }
    this.audioPlayer.loop = true;
    this.audioPlayer.play(this.audio);
  }

  private _sePlay() {
    this._seStop();
    if (!this.se || !this.se.isReady) {
      console.log(this.seIdentifier);
      console.log(this.se);
      return;
    }
    this.sePlayer.loop = false;
    this.sePlayer.play(this.se);
  }

  stop() {
    this.audioIdentifier = '';
    this.isPlaying = false;
    this._stop();
  }

  seStop() {
    this.seIdentifier = '';
    this.seIsPlaying = false;
    this._seStop();
  }

  private _stop() {
    this.unregisterEvent();
    this.audioPlayer.stop();
  }

  private _seStop() {
    this.sePlayer.stop();
  }

  private playAfterFileUpdate() {
    EventSystem.register(this)
      .on('UPDATE_AUDIO_RESOURE', -100, event => {
        this._play();
      });
  }

  private unlockAfterUserInteraction() {
    let callback = () => {
      document.body.removeEventListener('touchstart', callback, true);
      document.body.removeEventListener('mousedown', callback, true);
      this.audioPlayer.stop();
      if (this.isPlaying) this._play();
    }
    document.body.addEventListener('touchstart', callback, true);
    document.body.addEventListener('mousedown', callback, true);
  }

  private unregisterEvent() {
    EventSystem.unregister(this, 'UPDATE_AUDIO_RESOURE');
  }

  // override
  apply(context: ObjectContext) {
    let audioIdentifier = this.audioIdentifier;
    let isPlaying = this.isPlaying;
    super.apply(context);
    if ((audioIdentifier !== this.audioIdentifier || !isPlaying) && this.isPlaying) {
      this._play();
    } else if (isPlaying !== this.isPlaying && !this.isPlaying) {
      this._stop();
    }
  }
}
