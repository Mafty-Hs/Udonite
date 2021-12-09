import { Injectable } from '@angular/core';
import { DiceBot , DiceBotInfo, DiceBotInfosIndexed, DiceRollResult , api } from '@udonarium/dice-bot';
import { SvcDiceBotSetting } from '@udonarium/service/svc-dice-bot-setting'
import { ChatMessage, ChatMessageContext } from '@udonarium/chat-message';
import { ChatTab } from '@udonarium/chat-tab';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { EventSystem } from '@udonarium/core/system';
import { PromiseQueue } from '@udonarium/core/system/util/promise-queue';
import { StringUtil } from '@udonarium/core/system/util/string-util';
import { DiceRollTableList } from '@udonarium/dice-roll-table-list';
import { StandService } from 'service/stand.service';

@Injectable({
  providedIn: 'root'
})
export class DiceBotService {
  get diceBotInfos(): DiceBotInfo[] {return DiceBot.instance.diceBotInfos;} 
  get diceBotInfosIndexed(): DiceBotInfosIndexed[] {return DiceBot.instance.diceBotInfosIndexed;} 
  get isConnect():boolean { return DiceBot.instance.api.isConnect;}
  get api(): api {return DiceBot.instance.api;} 
  set api(_api) {DiceBot.instance.api = _api;}
  private queue: PromiseQueue = new PromiseQueue('DiceBotQueue');
  private gameType:string = "";
  private commandPattern:RegExp = new RegExp('^S?([+\\-(]*\\d+|\\d+B\\d+|C[+\\-(]*\\d+|choice|D66|(repeat|rep|x)\\d+|\\d+R\\d+|\\d+U\\d+|BCDiceVersion)',"i");
  private commandPatternBase:RegExp = new RegExp('^S?([+\\-(]*\\d+|\\d+B\\d+|C[+\\-(]*\\d+|choice|D66|(repeat|rep|x)\\d+|\\d+R\\d+|\\d+U\\d+|BCDiceVersion)',"i");
  private asciiPattern:RegExp = new RegExp('^[a-zA-Z0-9!-/:-@¥[-`{-~\}]+$');

  private bcDiceFilter(gameType:string ,rollText:string):string {
    console.log(rollText);
    rollText = this.textFilter(rollText);
    console.log(rollText);
    if (gameType === this.gameType) {
      if (this.commandPattern.test(rollText)) return rollText;
      return "";
    }
    if (this.commandPatternBase.test(rollText) || !this.asciiPattern.test(rollText)) return rollText;
    return "";
  }

  private textFilter(text :string):string {
    text = text.replace(/　/g," ");
    return text;
  }

  async diceRoll(messageIdentifier: string) {
    const chatMessage = ObjectStore.instance.get<ChatMessage>(messageIdentifier);
    if (!chatMessage || !chatMessage.isSendFromSelf || chatMessage.isSystem) return;

    const text: string = StringUtil.toHalfWidth(chatMessage.text).replace("\u200b", ''); //ゼロ幅スペース削除
    let gameType: string = chatMessage.tag.replace('noface', '').trim();
    gameType = gameType ? gameType : 'DiceBot';
    const regArray = /^((srepeat|repeat|srep|rep|sx|x)?(\d+)?[ 　]+)?([^\n]*)?/ig.exec(text);
    const repCommand = regArray[2];
    const isRepSecret = repCommand && repCommand.toUpperCase().indexOf('S') === 0;
    const repeat: number = (regArray[3] != null) ? Number(regArray[3]) : 1;
    let rollText: string = (regArray[4] != null) ? regArray[4] : text;
    rollText = rollText.replace(/Ⅾ/g, 'D');
    if (!rollText || repeat <= 0) return;
     let finalResult: DiceRollResult = { result: '', isSecret: false, isDiceRollTable: false, isEmptyDice: true,
     isSuccess: false, isFailure: true, isCritical: false, isFumble: false };

    if (await this.diceRollTableMatch(rollText, repeat, chatMessage)) return;
    rollText = this.bcDiceFilter(gameType,rollText);
    if (!rollText) return;
    if (repeat < 1) return;
    try {
      finalResult = await this.bcDice(rollText, gameType, repeat);
    }
    catch(e) {

    }
    finalResult.isSecret = finalResult.isSecret || isRepSecret;
    this.sendResultMessage(finalResult, chatMessage);
    return;
  }

  async diceRollTableMatch(rollText: string ,repeat ,chatMessage): Promise<boolean>{
    let diceRollTable = DiceRollTableList.instance.diceRollTables.find(
      (_diceRollTable) => 
      _diceRollTable.command.trim().toUpperCase()
       === rollText.trim().toUpperCase() ||
      'S' + _diceRollTable.command.trim().toUpperCase()
       === rollText.trim().toUpperCase()
    );
    if (!diceRollTable) return false;
    let finalResult: DiceRollResult = { result: '', isSecret: false, isDiceRollTable: false, isEmptyDice: true,
            isSuccess: false, isFailure: true, isCritical: false, isFumble: false };
    let isSecret = false;
    if ('S' + diceRollTable.command.trim().toUpperCase()
       === rollText.trim().toUpperCase()) isSecret = true;
    finalResult.isDiceRollTable = true;
    finalResult.tableName = (diceRollTable.name && diceRollTable.name.length > 0) ? diceRollTable.name : '(無名のダイスボット表)';
    finalResult.isSecret = isSecret 
    const diceRollTableRows = diceRollTable.parseText();

   for (let i = 0; i < repeat && i < 32; i++) {
     let rollResult = await this.bcDice(StringUtil.toHalfWidth(diceRollTable.dice), 'DiceBot', 1);
     finalResult.isEmptyDice = finalResult.isEmptyDice && rollResult.isEmptyDice;
     if (rollResult.result) rollResult.result = rollResult.result.replace('DiceBot : ', '').replace(/[＞]/g, s => '→').trim();
     let rollResultNumber = 0;
     let match = null;
     if (rollResult.result.length > 0 && (match = rollResult.result.match(/\s→\s(?:成功数)?(\-?\d+)$/))) {
       rollResultNumber = +match[1];
     }
     let isRowMatch = false;
     for (const diceRollTableRow of diceRollTableRows) {
       if ((diceRollTableRow.range.start === null || diceRollTableRow.range.start <= rollResultNumber) 
         && (diceRollTableRow.range.end === null || rollResultNumber <= diceRollTableRow.range.end)) {
         finalResult.result += ('🎲 ' + rollResult.result + "\n" + StringUtil.cr(diceRollTableRow.result));
       isRowMatch = true;
        break;
      }
    }
    if (!isRowMatch) finalResult.result += ('🎲 ' + rollResult.result + "\n" + '(結果なし)');
      if (1 < repeat) finalResult.result += ` #${i + 1}`;
      if (i < repeat - 1) finalResult.result += "\n";
    }
    this.sendResultMessage(finalResult, chatMessage);
    return true;
  }

  bcDice(message: string, gameType: string, repeat: number = 1): Promise<DiceRollResult> {
    gameType = gameType ? gameType : 'DiceBot';
    const request = `${this.api.url}/v2/game_system/${(gameType ? encodeURIComponent(gameType) : 'DiceBot')}/roll?command=${encodeURIComponent(message)}`;
    const promisise = [];
    for (let i = 1; i <= repeat; i++) {
      promisise.push(
        fetch(request, {mode: 'cors'})
          .then(response => {
            if (response.ok) {
              return response.json();
            }
            throw new Error(response.statusText);
          })
          .then(json => {
            return { result: (gameType) + ' ' + (json.text) + (repeat > 1 ? ` #${i}\n` : ''), isSecret: json.secret, 
            isEmptyDice: (json.rands && json.rands.length == 0),
            isSuccess: json.success, isFailure: json.failure, isCritical: json.critical, isFumble: json.fumble };
          })
          .catch(e => {
            return { result: '', isSecret: false,  isEmptyDice: true };
          })
      );
    }
      return this.queue.add(
      Promise.all(promisise)
        .then(results => { return results.reduce((ac, cv) => {
          let result = ac.result + cv.result;
          let isSecret = ac.isSecret || cv.isSecret;
          let isEmptyDice = ac.isEmptyDice && cv.isEmptyDice;
          let isSuccess = ac.isSuccess || cv.isSuccess;
          let isFailure = ac.isFailure && cv.isFailure;
          let isCritical = ac.isCritical || cv.isCritical;
          let isFumble = ac.isFumble || cv.isFumble;
          return { result: result, isSecret: isSecret, isEmptyDice: isEmptyDice, 
            isSuccess: isSuccess, isFailure: isFailure, isCritical: isCritical, isFumble: isFumble };
        }, { result: '', isSecret: false, isEmptyDice: true, isSuccess: false, isFailure: true, isCritical: false, isFumble: false }) })
      );
  }

  initialize(apiUrl:string) {
    DiceBot.instance.initialize();
    this.api.url = (apiUrl.substr(apiUrl.length - 1) === '/') ? apiUrl.substr(0, apiUrl.length - 1) : apiUrl;
    this.api.version = 2
    let svcDiceBotSetting = new SvcDiceBotSetting;
    svcDiceBotSetting.loadDiceInfo();
    EventSystem.register(this)
      .on('SEND_MESSAGE', event => { this.diceRoll(event.data.messageIdentifier) });
  }  

  getHelpMessage(gameType: string): Promise<string|string[]> {
    gameType = gameType ? gameType : 'DiceBot';
     const promisise = [
        fetch(`${this.api.url}/v2/game_system/DiceBot`, {mode: 'cors'})
          .then(response => { return response.json() })
      ];
      if (gameType && gameType != 'DiceBot') {
        promisise.push(
          fetch(`${this.api.url}/v2/game_system/${encodeURIComponent(gameType)}`, {mode: 'cors'})
            .then(response => { return response.json() })
        );
      }
      return Promise.all(promisise)
        .then(jsons => { 
          return jsons.map(json => {
            if (json.help_message) {
              this.gameType = gameType;
              this.commandPattern = new RegExp(json.command_pattern,"i");
              return json.help_message.replace('部屋のシステム名', 'チャットパレットなどのシステム名');
            } else {
              return 'ダイスボット情報がありません。';
            }                
          }) 
        });
    } 

   private sendResultMessage(rollResult: DiceRollResult, originalMessage: ChatMessage) {
    let result: string = rollResult.result;
    const isSecret: boolean = rollResult.isSecret;
    const isEmptyDice: boolean = rollResult.isEmptyDice;
    const isSuccess: boolean = rollResult.isSuccess;
    const isFailure: boolean = rollResult.isFailure;
    const isCritical: boolean = rollResult.isCritical;
    const isFumble: boolean = rollResult.isFumble;

    if (result.length < 1) return;
    if (!rollResult.isDiceRollTable) result = result.replace(/[＞]/g, s => '→').trim();

    let tag = 'system';
    if (isSecret) tag += ' secret';
    if (isEmptyDice) tag += ' empty';
    if (isSuccess) tag += ' success';
    if (isFailure) tag += ' failure';
    if (isCritical) tag += ' critical';
    if (isFumble) tag += ' fumble';

    let diceBotMessage: ChatMessageContext = {
      identifier: '',
      tabIdentifier: originalMessage.tabIdentifier,
      originFrom: originalMessage.from,
      from: rollResult.isDiceRollTable ? 'Dice-Roll Table' : `BCDice-API(${this.api.url})`,
      timestamp: originalMessage.timestamp + 1,
      imageIdentifier: '',
      tag: tag,
      name: rollResult.isDiceRollTable ? 
        isSecret ? '<' + rollResult.tableName + ' (Secret)：' + originalMessage.name + '>' : '<' + rollResult.tableName + '：' + originalMessage.name + '>' :
        isSecret ? '<Secret-BCDice：' + originalMessage.name + '>' : '<BCDice：' + originalMessage.name + '>' ,
      text: result,
      color: originalMessage.color,
      isUseStandImage: originalMessage.isUseStandImage
    };

    let matchMostLongText = '';
    // ダイスボットへのスタンドの反応
    if (!isSecret && !originalMessage.standName && originalMessage.isUseStandImage) {
      this.standService.diceBotShowStand(result,originalMessage.characterIdentifier,originalMessage.to,originalMessage.color,originalMessage.imageIdentifier);
    }
    
    const chatTab = ObjectStore.instance.get<ChatTab>(originalMessage.tabIdentifier);
    if (!isSecret && chatTab.isUseStandImage) {
      this.standService.cutIn(result,originalMessage.to);
    }

    if (originalMessage.to != null && 0 < originalMessage.to.length) {
      diceBotMessage.to = originalMessage.to;
      if (originalMessage.to.indexOf(originalMessage.from) < 0) {
        diceBotMessage.to += ' ' + originalMessage.from;
      }
    }
    if (chatTab) chatTab.addMessage(diceBotMessage);
  }


  constructor(
    private standService: StandService
  ) { }
}
