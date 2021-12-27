import { Injectable } from '@angular/core';
import { DiceBot , DiceBotInfo, DiceBotInfosIndexed, DiceRollResult , api } from '@udonarium/dice-bot';
import { SvcDiceBotSetting } from '@udonarium/service/svc-dice-bot-setting'
import { ChatMessage, ChatMessageContext } from '@udonarium/chat-message';
import { ChatTab } from '@udonarium/chat-tab';
import { ObjectStore } from '@udonarium/core/synchronize-object/object-store';
import { EventSystem } from '@udonarium/core/system';
import { StringUtil } from '@udonarium/core/system/util/string-util';
import { DiceRollTableList } from '@udonarium/dice-roll-table-list';
import { StandService } from 'service/stand.service';

interface rollDataContext {
  rollText:string;
  repeatText:string;
  isSecret:boolean;
  isDiceRollTable:boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DiceBotService {
  get diceBotInfos(): DiceBotInfo[] {return DiceBot.instance.diceBotInfos;} 
  get diceBotInfosIndexed(): DiceBotInfosIndexed[] {return DiceBot.instance.diceBotInfosIndexed;} 
  get isConnect():boolean { return DiceBot.instance.api.isConnect;}
  get api(): api {return DiceBot.instance.api;} 
  set api(_api) {DiceBot.instance.api = _api;}
  private gameType:string = "";
  private secretPattern:RegExp = new RegExp('^[s|ｓ|S]',"i")
  private repeatPattern:RegExp = new RegExp('^S?((repeat|rep|x)\\d+)',"i");
  private commandPattern:RegExp = new RegExp('^S?([+\\-(]*\\d+|\\d+B\\d+|C[+\\-(]*\\d+|choice|D66|(repeat|rep|x)\\d+|\\d+R\\d+|\\d+U\\d+|BCDiceVersion)',"i");
  private commandPatternBase:RegExp = new RegExp('^S?([+\\-(]*\\d+|\\d+B\\d+|C[+\\-(]*\\d+|choice|D66|(repeat|rep|x)\\d+|\\d+R\\d+|\\d+U\\d+|BCDiceVersion)',"i");
  private choicePattern:RegExp = new RegExp('^S?choice[\u{20}\[\(]',"i");
  private choicePattern1:RegExp = new RegExp('^S?choice\(.*\)',"i");
  private choicePattern2:RegExp = new RegExp('^S?choice\[.*\]',"i");
  private asciiPattern:RegExp = new RegExp('^[a-zA-Z0-9!-/:-@¥[-`{-~\}]+$');
  private symbolPattern:RegExp = new RegExp('（）［］',"g");

  private async bcDiceFilter(gameType:string ,rollText:string):Promise<string> {
    if (gameType === this.gameType) {
      if (this.commandPattern.test(rollText)) return rollText;
      return "";
    }
    else if (gameType === "DiceBot") {
      if (this.commandPatternBase.test(rollText)) return rollText;
      return "";
    }
    else {
      let newCommandPattern:RegExp = await this.getCommandPattern(gameType);
      if (newCommandPattern.test(rollText)) return rollText;
      return "";
    }
  }

  private textFilter(text :string):string {
    let newText = text.split("\u{20}")[0];
    return newText.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {
      return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    }).trim();
  }

  private choiceFilter(rollText :string): [string ,boolean] {
    let choiceText = rollText.replace(this.symbolPattern, function(s) {
      return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    })
    if (this.choicePattern.test(choiceText)) {
      if (this.textFilter(choiceText).toLocaleLowerCase() === "choice" ||
      this.textFilter(choiceText).toLocaleLowerCase() === "schoice" ) return [choiceText ,true];
      else if (this.choicePattern1.test(choiceText)) return [choiceText.replace(/\).*$/,')') ,true];
      else if (this.choicePattern2.test(choiceText)) return [choiceText.replace(/\].*$/,']') ,true];
    } 
    return [rollText ,false]
  }

  private repeatFilter(text :string): [string ,string] {
    let secret :string = "";
    let rollText :string = text;
    if (this.secretPattern.test(rollText)) {
      rollText = rollText.substring(1)
      secret = "s"
    }
     let repeat :string = rollText.split("\u{20}")[0].trim();
     if (!isNaN(Number(repeat))) {
      rollText = "x" + rollText;
      repeat = "x" + repeat;
    }
    if (this.repeatPattern.test(repeat)) {
      rollText = rollText.substring(repeat.length).trim();
      repeat = secret + repeat;
      return [rollText, repeat];
    }
    else {
      return [text,"" ];
    }
  }

  private rollTableFilter(rollData :rollDataContext): rollDataContext {
    let diceRollTable = DiceRollTableList.instance.diceRollTables.find(
      (_diceRollTable) => 
      _diceRollTable.command.trim().toLowerCase()
       === rollData.rollText.trim().toLowerCase() ||
      's' + _diceRollTable.command.trim().toLowerCase()
       === rollData.rollText.trim().toLowerCase()
    );

    if (!diceRollTable) return rollData;
    rollData.isDiceRollTable = true;
    if ('s' + diceRollTable.command.trim().toLowerCase()
    === rollData.rollText.trim().toLowerCase()) rollData.isSecret = true;
    rollData.rollText = diceRollTable.requestText;
    return rollData
  }

  private async rollFilter(gameType :string ,text :string):Promise<rollDataContext> {
    let isChoice:boolean = false;
    let resultRollData:rollDataContext = 
      {rollText: "",repeatText: "",isSecret: false,isDiceRollTable: false};

    [resultRollData.rollText ,resultRollData.repeatText] = this.repeatFilter(text);
    [resultRollData.rollText ,isChoice] = this.choiceFilter(resultRollData.rollText);
    if (isChoice) return resultRollData;

    resultRollData.rollText = this.textFilter(resultRollData.rollText).toLocaleLowerCase();
    if (!this.asciiPattern.test(resultRollData.rollText)) {
      resultRollData.rollText = "";
      return resultRollData;
    };
    resultRollData = this.rollTableFilter(resultRollData);
    if (resultRollData.isDiceRollTable) return resultRollData;

    resultRollData.rollText = await this.bcDiceFilter(gameType ,resultRollData.rollText)
    return resultRollData;
  }

  async diceRoll(messageIdentifier: string) {
    const chatMessage = ObjectStore.instance.get<ChatMessage>(messageIdentifier);
    if (!this.isConnect || !chatMessage || !chatMessage.isSendFromSelf || chatMessage.isSystem) return;
    let text: string = StringUtil.toHalfWidth(chatMessage.text).replace("\u200b", '')
      .replace(/Ⅾ/g, 'D')
      .replace(/\s/g,"\u{20}").trim();
    let gameType: string = chatMessage.tag.replace('noface', '').trim();
    gameType = gameType ? gameType : 'DiceBot';
    let rollData:rollDataContext = await this.rollFilter(gameType ,text);
    let finalResult: DiceRollResult = { result: '', isSecret: false, isDiceRollTable: false, isEmptyDice: true,
     isSuccess: false, isFailure: true, isCritical: false, isFumble: false };
    if (!rollData.rollText) return;

    try {
      if (rollData.isDiceRollTable) {
        finalResult = await this.rollTable(rollData.rollText, rollData.repeatText);
        finalResult.isSecret = rollData.isSecret;
      }
      else {
        finalResult = await this.bcDice(rollData.rollText, gameType, rollData.repeatText);
      }
    }
    catch(e) {

    }
    this.sendResultMessage(finalResult, chatMessage);
    return;
  }

  async bcDice(message: string, gameType: string, repeatText?: string): Promise<DiceRollResult> {
    gameType = gameType ? gameType : 'DiceBot';
    message = repeatText ? repeatText + " " + message : message;
    const request = `${this.api.url}/v2/game_system/${(gameType ? encodeURIComponent(gameType) : 'DiceBot')}/roll?command=${encodeURIComponent(message)}`;
    let dataResult:DiceRollResult = { result: '', isSecret: false, isDiceRollTable: false, isEmptyDice: true,
      isSuccess: false, isFailure: true, isCritical: false, isFumble: false };

    let response:Response = await fetch(request, {mode: 'cors'})
      if (response.ok) {
        let json = await response.json()
        let text = String(json.text);
        if (repeatText) {
          text = text.replace(/\n\n/g,"\t").replace(/\n/g," ").replace(/\t/g,"\n")
        }
        return { result: text, isSecret: json.secret, 
            isEmptyDice: (json.rands && json.rands.length == 0),
            isSuccess: json.success, isFailure: json.failure, isCritical: json.critical, isFumble: json.fumble };
      }
      else {
        throw new Error(response.statusText);
      }

    return dataResult; 
  }

  async rollTable(message: string, repeatText?: string): Promise<DiceRollResult> {
    const request = `${this.api.url}/v2/original_table`;
    let dataResult:DiceRollResult = { result: '', isSecret: false, isDiceRollTable: true, isEmptyDice: true,
      isSuccess: false, isFailure: true, isCritical: false, isFumble: false };
    const postMessage = new URLSearchParams;
    postMessage.append('table' ,message)
    let response:Response = await fetch(request, {method: 'POST', body: postMessage , mode: 'cors'})
      if (response.ok) {
        let json = await response.json()
        dataResult.isEmptyDice = (json.rands && json.rands.length == 0),
        dataResult.result = String(json.text); 
        return dataResult;
      }
      else {
        throw new Error(response.statusText);
      }

    return dataResult; 
  }

  initialize(apiUrl:string) {
    DiceBot.instance.initialize();
    this.api.url = (apiUrl.substr(apiUrl.length - 1) === '/') ? apiUrl.substr(0, apiUrl.length - 1) : apiUrl;
    this.api.version = 2
    let svcDiceBotSetting = new SvcDiceBotSetting;
    svcDiceBotSetting.getBcDiceVersion();
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
              if (gameType && gameType != 'DiceBot') {
                this.gameType = gameType;
                this.commandPattern = new RegExp(json.command_pattern,"i");
              }
              return json.help_message.replace('部屋のシステム名', 'チャットパレットなどのシステム名');
            } else {
              return 'ダイスボット情報がありません。';
            }                
          }) 
        });
  }
  
  async getCommandPattern(gameType: string): Promise<RegExp> {
    gameType = gameType ? gameType : 'DiceBot';
    let response:Response;
    try {
      response = await fetch(`${this.api.url}/v2/game_system/${encodeURIComponent(gameType)}`, {mode: 'cors'})
      if (response.ok) {
        let regtxt = response.json()[0].command_pattern;
        return new RegExp(regtxt,"i");
      }
    }
    catch {
     console.log(response.statusText);
    }
    return this.commandPatternBase;
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
        isSecret ? '<Dice-Roll Table (Secret)：' + originalMessage.name + '>' : '<Dice-Roll Table：' + originalMessage.name + '>' :
        isSecret ? '<Secret-BCDice：' + originalMessage.name + '>' : '<BCDice：' + originalMessage.name + '>' ,
      text: result,
      color: originalMessage.color,
      isUseStandImage: originalMessage.isUseStandImage
    };

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
