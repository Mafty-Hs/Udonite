import { AudioFile } from './audio-file';
import { FileReaderUtil } from './file-reader-util';

export enum VolumeType {
  MASTER,
  AUDITION,
  SE,
}

declare global {
  interface Window {
    AudioContext: typeof AudioContext;
    webkitAudioContext: typeof AudioContext;
  }
}

export class AudioPlayer {
  private static _audioContext: AudioContext;

  static calcVolume(audio :AudioFile) :number {
    let volume = audio.volume / 400;
    return volume;
  }

  static get audioContext(): AudioContext {
    if (!AudioPlayer._audioContext) AudioPlayer._audioContext = new (window.AudioContext || window.webkitAudioContext)();
    return AudioPlayer._audioContext;
  }

  private static _volume: number = 2;
  static get volume(): number { return AudioPlayer._volume / 4; }
  static set volume(volume: number) {
    let value = volume *4;
    AudioPlayer._volume = value;
    AudioPlayer.masterGainNode.gain.setTargetAtTime(value, AudioPlayer.audioContext.currentTime, 0.01);
  }

  private static _seVolume: number = 2;
  static get seVolume(): number { return AudioPlayer._seVolume / 4; }
  static set seVolume(seVolume: number) {
    let value =  seVolume *4;
    AudioPlayer._seVolume = value;
    AudioPlayer.seGainNode.gain.setTargetAtTime(value, AudioPlayer.audioContext.currentTime, 0.01);
  }

  private static _auditionVolume: number = 2;
  static get auditionVolume(): number { return AudioPlayer._auditionVolume / 4; }
  static set auditionVolume(auditionVolume: number) {
    let value =  auditionVolume *4;
    AudioPlayer._auditionVolume = value;
    AudioPlayer.auditionGainNode.gain.setTargetAtTime(value, AudioPlayer.audioContext.currentTime, 0.01);
  }

  private static _masterGainNode: GainNode
  private static get masterGainNode(): GainNode {
    if (!AudioPlayer._masterGainNode) {
      let masterGain = AudioPlayer.audioContext.createGain();
      masterGain.gain.setValueAtTime(AudioPlayer._volume, AudioPlayer.audioContext.currentTime);
      masterGain.connect(AudioPlayer.audioContext.destination);
      AudioPlayer._masterGainNode = masterGain;
    }
    return AudioPlayer._masterGainNode;
  }

  private static _auditionGainNode: GainNode
  private static get auditionGainNode(): GainNode {
    if (!AudioPlayer._auditionGainNode) {
      let auditionGain = AudioPlayer.audioContext.createGain();
      auditionGain.gain.setValueAtTime(AudioPlayer._auditionVolume, AudioPlayer.audioContext.currentTime);
      auditionGain.connect(AudioPlayer.audioContext.destination);
      AudioPlayer._auditionGainNode = auditionGain;
    }
    return AudioPlayer._auditionGainNode;
  }
  private static _seGainNode: GainNode
  private static get seGainNode(): GainNode {
    if (!AudioPlayer._seGainNode) {
      let seGain = AudioPlayer.audioContext.createGain();
      seGain.gain.setValueAtTime(AudioPlayer._seVolume, AudioPlayer.audioContext.currentTime);
      seGain.connect(AudioPlayer.audioContext.destination);
      AudioPlayer._seGainNode = seGain;
    }
    return AudioPlayer._seGainNode;
  }


  static get rootNode(): AudioNode { return AudioPlayer.masterGainNode; }
  static get auditionNode(): AudioNode { return AudioPlayer.auditionGainNode; }
  static get seNode(): AudioNode { return AudioPlayer.seGainNode; }

  private _audioElm: HTMLAudioElement;
  private get audioElm(): HTMLAudioElement {
    if (!this._audioElm) {
      this._audioElm = new Audio();
      this._audioElm.onplay = () => { }
      this._audioElm.onpause = () => { this.mediaElementSource.disconnect(); }
      this._audioElm.onended = () => { this.mediaElementSource.disconnect(); }
    }
    return this._audioElm;
  }

  private _mediaElementSource: MediaElementAudioSourceNode;
  private get mediaElementSource(): MediaElementAudioSourceNode {
    if (!this._mediaElementSource) this._mediaElementSource = AudioPlayer.audioContext.createMediaElementSource(this.audioElm);
    return this._mediaElementSource;
  }

  audio: AudioFile;
  volumeType: VolumeType = VolumeType.MASTER;

  get volume(): number { return this.audioElm.volume; }
  set volume(volume) { this.audioElm.volume = volume; }
  get loop(): boolean { return this.audioElm.loop; }
  set loop(loop) { this.audioElm.loop = loop; }
  get paused(): boolean { return this.audioElm.paused; }

  constructor(audio?: AudioFile) {
    this.audio = audio;
  }

  async play(audio: AudioFile = this.audio, volume: number = 1.0) {
    this.stop();
    this.audio = audio;
    if (!this.audio) return;

    let url = await this.audio.url();

    this.mediaElementSource.connect(this.getConnectingAudioNode());
    this.audioElm.src = url;
    this.audioElm.crossOrigin = 'anonymous';
    this.audioElm.load();
    this.volume =  AudioPlayer.calcVolume(audio);
    this.audioElm.play().catch(reason => { console.warn(reason); });
  }

  pause() {
    this.audioElm.pause();
  }

  stop() {
    if (!this.audioElm) return;
    this.pause();
    this.audioElm.currentTime = 0;
    this.audioElm.src = '';
    this.audioElm.load();
    this.mediaElementSource.disconnect();
  }

  private getConnectingAudioNode() {
    switch (this.volumeType) {
      case VolumeType.AUDITION:
        return AudioPlayer.auditionNode;
      case VolumeType.SE:
        return AudioPlayer.seNode;
      default:
        return AudioPlayer.rootNode;
    }
  }


  static resumeAudioContext() {
    AudioPlayer.audioContext.resume();
    let callback = () => {
      AudioPlayer.audioContext.resume();
      document.removeEventListener('touchstart', callback, true);
      document.removeEventListener('mousedown', callback, true);
      console.log('resumeAudioContext');
    }
    document.addEventListener('touchstart', callback, true);
    document.addEventListener('mousedown', callback, true);
  }
}
