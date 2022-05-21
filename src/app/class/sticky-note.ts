import { SyncObject, SyncVar } from './core/synchronize-object/decorator';
import { ObjectNode } from './core/synchronize-object/object-node';
import { ObjectStore } from './core/synchronize-object/object-store';
import { ChatMessage } from './chat-message';

@SyncObject('sticky-note')
export class StickyNote extends ObjectNode {
  @SyncVar() chatMessageIdentifiers: string[] = [];

  addMessage(identifier :string) {
    if (this.chatMessageIdentifiers.includes(identifier)) return;
    this.chatMessageIdentifiers.push(identifier);
    this.update();
  }

  removeMessage(identifier :string) {
    if (!this.chatMessageIdentifiers.includes(identifier)) return;
    this.chatMessageIdentifiers = this.chatMessageIdentifiers.filter(_identifier => _identifier != identifier);
    this.update();
  }

  getMessages():ChatMessage[] {
    let messages:ChatMessage[] = [];
    const chatMessageIdentifiers = this.chatMessageIdentifiers;
    for (let identifier of chatMessageIdentifiers) {
      let message = ObjectStore.instance.get<ChatMessage>(identifier);
      if (message) messages.push(message);
      else this.removeMessage(identifier);
    }
    return messages;
  }

  static _Shared: StickyNote = null;

  static get Shared(): StickyNote {
    if (!StickyNote._Shared) {
      StickyNote._Shared = ObjectStore.instance.get<StickyNote>('sitcky-note');
      if (!StickyNote._Shared) {
        StickyNote._Shared = new StickyNote('sitcky-note');
        StickyNote._Shared.initialize();
      }
    }
    return StickyNote._Shared;
  }

}
