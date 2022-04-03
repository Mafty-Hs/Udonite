import { ChatMessage } from './chat-message';
import { AudioFile } from './core/file-storage/audio-file';
import { SyncObject } from './core/synchronize-object/decorator';
import { GameObject } from './core/synchronize-object/game-object';
import { ObjectStore } from './core/synchronize-object/object-store';
import { EventSystem } from './core/system';

export class PresetSound {
  static dicePick: string = 'dicePick';
  static dicePut: string = 'dicePut';
  static diceRoll1: string = 'diceRoll1';
  static diceRoll2: string = 'diceRoll2';
  static cardDraw: string = 'cardDraw';
  static cardPick: string = 'cardPIck';
  static cardPut: string = 'cardPut';
  static cardShuffle: string = 'cardShuffle';
  static piecePick: string = 'piecePick';
  static piecePut: string = 'piecePut';
  static blockPick: string = 'blockPick';
  static blockPut: string = 'blockPut';
  static lock: string = 'lock';
  static unlock: string = 'unlock';
  static sweep: string = 'sweep';
  static puyon: string = 'puyon';
  static surprise: string = 'surprise';
  static coinToss: string = 'coinToss';
  static alarm: string = 'alarm';
  static pikon: string = 'pikon';
}

@SyncObject('sound-effect')
export class SoundEffect extends GameObject {
  // GameObject Lifecycle
  onStoreAdded() {
    super.onStoreAdded();
    EventSystem.register(this)
      .on('SEND_MESSAGE', event => {
        let chatMessage = ObjectStore.instance.get<ChatMessage>(event.data.messageIdentifier);
        if (!chatMessage || !chatMessage.isSendFromSelf || chatMessage.isEmptyDice) return;
        if (Math.random() < 0.5) {
          SoundEffect.play(PresetSound.diceRoll1);
        } else {
          SoundEffect.play(PresetSound.diceRoll2);
        }
      });
  }

  // GameObject Lifecycle
  onStoreRemoved() {
    super.onStoreRemoved();
    EventSystem.unregister(this);
  }

  play(identifier: string)
  play(audio: AudioFile)
  play(arg: any) {
    SoundEffect.play(arg);
  }

  static play(identifier: string)
  static play(audio: AudioFile)
  static play(arg: any) {
    let identifier = '';
    if (typeof arg === 'string') {
      identifier = arg;
    } else {
      identifier = arg.identifier;
    }
    SoundEffect._play(identifier);
  }

  private static _play(identifier: string) {
    EventSystem.call('SOUND_EFFECT', identifier);
  }
}
