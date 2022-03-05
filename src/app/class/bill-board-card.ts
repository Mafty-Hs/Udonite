import { SyncObject, SyncVar } from './core/synchronize-object/decorator';
import { ObjectNode } from './core/synchronize-object/object-node';
import { StringUtil } from './core/system/util/string-util';

export interface BillBoardCardContext {
  identifier?: string;
  title: string;
  text: string;
  dataType:string;
  ownerName: string;
  ownerPlayer: string[];
  allowPlayers?: string[];
  imageIdentifier: string;
}

@SyncObject('bill-board-card')
export class BillBoardCard extends ObjectNode {
  @SyncVar() title: string;
  @SyncVar() text: string;
  @SyncVar() dataType:string;
  @SyncVar() ownerName: string;
  @SyncVar() ownerPlayer: string[];
  @SyncVar() allowPlayers: string[];
  @SyncVar() imageIdentifier: string;

  get isImage():boolean {
    return this.imageIdentifier.length > 0;
  }

  get titleWithoutRuby():string {
    let html = StringUtil.escapeHtmlAndRuby(this.title);
    return html
      .replace(/<ruby>/g,'')
      .replace(/<\/ruby>/g,'')
      .replace(/<rt>.*?<\/rt>/g,'');
  }

  get titleAsHtml():string {
    return StringUtil.escapeHtmlAndRuby(this.title)
  }

}
