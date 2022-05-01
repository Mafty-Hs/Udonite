import { AudioFile } from './audio-file';
import { AudioContext } from './audio-context';
import { IONetwork } from '../system';

export class AudioStorage {
  private static _instance: AudioStorage
  static get instance(): AudioStorage {
    if (!AudioStorage._instance) AudioStorage._instance = new AudioStorage();
    return AudioStorage._instance;
  }

  get dataSize():number {
    return Object.values(this.audioHash).reduce((totalSize, Audio) => totalSize + Audio.context.filesize ,0 )
  }

  private audioHash: { [identifier: string]: AudioFile } = {};

  get audios(): AudioFile[] {
    let audios: AudioFile[] = [];
    for (let identifier in this.audioHash) {
      let audio = this.audioHash[identifier];
      if (!audio.isHidden)
        audios.push(audio);
    }
    return audios;
  }

  private constructor() {
    console.log('AudioStorage ready...');
  }

  private set(context :AudioContext): AudioFile {
    let audio = new AudioFile();
    audio.context = context;
    return audio;
  }

  create(context :AudioContext) {
    let audio = this.set(context);
    this.audioHash[audio.identifier] = audio;
  }

  update(context :AudioContext) {
    let audio = this.get(context.identifier);
    audio.context = context;
  }

  remove(identifier :string) {
    IONetwork.audioRemove(identifier);
  }

  destroy(identifier: string): boolean {
    let deleteAudio: AudioFile = this.audioHash[identifier];
    if (deleteAudio) {
      delete this.audioHash[identifier];
      return true;
    }
    return false;
  }

  get(identifier: string): AudioFile {
    let audio: AudioFile = this.audioHash[identifier];
    if (audio) return audio;
    return null;
  }


  async getCatalog() {
    let audios = await IONetwork.audioMap()
    for (let audio of audios) {
      if (!this.audioHash[audio.identifier])
        this.audioHash[audio.identifier] = this.set(audio);
    }
  }
}
