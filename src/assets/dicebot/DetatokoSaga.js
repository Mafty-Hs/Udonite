/* Generated by Opal 0.11.4 */
(function(Opal) {
  function $rb_plus(lhs, rhs) {
    return (typeof(lhs) === 'number' && typeof(rhs) === 'number') ? lhs + rhs : lhs['$+'](rhs);
  }
  function $rb_ge(lhs, rhs) {
    return (typeof(lhs) === 'number' && typeof(rhs) === 'number') ? lhs >= rhs : lhs['$>='](rhs);
  }
  function $rb_gt(lhs, rhs) {
    return (typeof(lhs) === 'number' && typeof(rhs) === 'number') ? lhs > rhs : lhs['$>'](rhs);
  }
  function $rb_minus(lhs, rhs) {
    return (typeof(lhs) === 'number' && typeof(rhs) === 'number') ? lhs - rhs : lhs['$-'](rhs);
  }
  function $rb_divide(lhs, rhs) {
    return (typeof(lhs) === 'number' && typeof(rhs) === 'number') ? lhs / rhs : lhs['$/'](rhs);
  }
  function $rb_times(lhs, rhs) {
    return (typeof(lhs) === 'number' && typeof(rhs) === 'number') ? lhs * rhs : lhs['$*'](rhs);
  }
  var self = Opal.top, $nesting = [], nil = Opal.nil, $breaker = Opal.breaker, $slice = Opal.slice, $klass = Opal.klass, $send = Opal.send, $truthy = Opal.truthy;

  Opal.add_stubs(['$setPrefixes', '$debug', '$checkRoll', '$empty?', '$checkJudgeValue', '$rollTableCommand', '$=~', '$to_i', '$last_match', '$nil?', '$getRollResult', '$+', '$getSuccess', '$getCheckFlagResult', '$==', '$times', '$roll', '$[]=', '$join', '$sort', '$!=', '$reverse', '$[]', '$>=', '$>', '$getDownWill', '$getModifyText', '$getTotalResultValue', '$===', '$-', '$getTotalResultValueWhenSlash', '$ceil', '$/', '$*', '$upcase', '$choiceStrengthStigmaTable', '$choiceWillStigmaTable', '$choiceStrengthBadEndTable', '$choiceWillBadEndTable', '$get_table_by_2d6']);
  return (function($base, $super, $parent_nesting) {
    function $DetatokoSaga(){};
    var self = $DetatokoSaga = $klass($base, $super, 'DetatokoSaga', $DetatokoSaga);

    var def = self.$$proto, $nesting = [self].concat($parent_nesting), TMP_DetatokoSaga_initialize_1, TMP_DetatokoSaga_gameName_2, TMP_DetatokoSaga_gameType_3, TMP_DetatokoSaga_getHelpMessage_4, TMP_DetatokoSaga_rollDiceCommand_5, TMP_DetatokoSaga_checkRoll_6, TMP_DetatokoSaga_getRollResult_8, TMP_DetatokoSaga_getSuccess_9, TMP_DetatokoSaga_getCheckFlagResult_10, TMP_DetatokoSaga_getDownWill_11, TMP_DetatokoSaga_checkJudgeValue_12, TMP_DetatokoSaga_getModifyText_13, TMP_DetatokoSaga_getTotalResultValue_14, TMP_DetatokoSaga_getTotalResultValueWhenSlash_15, TMP_DetatokoSaga_rollTableCommand_16, TMP_DetatokoSaga_choiceStrengthStigmaTable_17, TMP_DetatokoSaga_choiceWillStigmaTable_18, TMP_DetatokoSaga_choiceStrengthBadEndTable_19, TMP_DetatokoSaga_choiceWillBadEndTable_20;

    
    self.$setPrefixes(["\\d+DS.*", "\\d+JD.*", "SST", "StrengthStigmaTable", "WST", "WillStigmaTable", "SBET", "StrengthBadEndTable", "WBET", "WillBadEndTable"]);
    
    Opal.defn(self, '$initialize', TMP_DetatokoSaga_initialize_1 = function $$initialize() {
      var self = this, $iter = TMP_DetatokoSaga_initialize_1.$$p, $yield = $iter || nil, $zuper = nil, $zuper_i = nil, $zuper_ii = nil;

      if ($iter) TMP_DetatokoSaga_initialize_1.$$p = null;
      // Prepare super implicit arguments
      for($zuper_i = 0, $zuper_ii = arguments.length, $zuper = new Array($zuper_ii); $zuper_i < $zuper_ii; $zuper_i++) {
        $zuper[$zuper_i] = arguments[$zuper_i];
      }
      
      $send(self, Opal.find_super_dispatcher(self, 'initialize', TMP_DetatokoSaga_initialize_1, false), $zuper, $iter);
      self.sendMode = 2;
      self.sortType = 1;
      return (self.d66Type = 2);
    }, TMP_DetatokoSaga_initialize_1.$$arity = 0);
    
    Opal.defn(self, '$gameName', TMP_DetatokoSaga_gameName_2 = function $$gameName() {
      var self = this;

      return "でたとこサーガ"
    }, TMP_DetatokoSaga_gameName_2.$$arity = 0);
    
    Opal.defn(self, '$gameType', TMP_DetatokoSaga_gameType_3 = function $$gameType() {
      var self = this;

      return "DetatokoSaga"
    }, TMP_DetatokoSaga_gameType_3.$$arity = 0);
    
    Opal.defn(self, '$getHelpMessage', TMP_DetatokoSaga_getHelpMessage_4 = function $$getHelpMessage() {
      var self = this;

      return "" + "・通常判定　xDS or xDSy or xDS>=z or xDSy>=z\n" + "　(x＝スキルレベル、y＝現在フラグ値(省略時0)、z＝目標値(省略時８))\n" + "　例）3DS　2DS5　0DS　3DS>=10　3DS7>=12\n" + "・判定値　xJD or xJDy or xJDy+z or xJDy-z or xJDy/z\n" + "　(x＝スキルレベル、y＝現在フラグ値(省略時0)、z＝修正値(省略時０))\n" + "　例）3JD　2JD5　3JD7+1　4JD/3\n" + "・体力烙印表　SST (StrengthStigmaTable)\n" + "・気力烙印表　WST (WillStigmaTable)\n" + "・体力バッドエンド表　SBET (StrengthBadEndTable)\n" + "・気力バッドエンド表　WBET (WillBadEndTable)\n"
    }, TMP_DetatokoSaga_getHelpMessage_4.$$arity = 0);
    
    Opal.defn(self, '$rollDiceCommand', TMP_DetatokoSaga_rollDiceCommand_5 = function $$rollDiceCommand(command) {
      var self = this, result = nil;

      
      self.$debug("rollDiceCommand begin string", command);
      result = "";
      result = self.$checkRoll(command);
      if ($truthy(result['$empty?']())) {
        } else {
        return result
      };
      result = self.$checkJudgeValue(command);
      if ($truthy(result['$empty?']())) {
        } else {
        return result
      };
      self.$debug("各種表として処理");
      return self.$rollTableCommand(command);
    }, TMP_DetatokoSaga_rollDiceCommand_5.$$arity = 1);
    
    Opal.defn(self, '$checkRoll', TMP_DetatokoSaga_checkRoll_6 = function $$checkRoll(string) {
      var $a, $b, self = this, target = nil, skill = nil, flag = nil, result = nil, total = nil, rollText = nil, success = nil;

      
      self.$debug("checkRoll begin string", string);
      if ($truthy(/^(\d+)DS(\d+)?((>=)(\d+))?$/i['$=~'](string))) {
        } else {
        return ""
      };
      target = 8;
      skill = Opal.const_get_relative($nesting, 'Regexp').$last_match(1).$to_i();
      flag = Opal.const_get_relative($nesting, 'Regexp').$last_match(2).$to_i();
      if ($truthy(Opal.const_get_relative($nesting, 'Regexp').$last_match(5)['$nil?']())) {
        } else {
        target = Opal.const_get_relative($nesting, 'Regexp').$last_match(5).$to_i()
      };
      result = "" + "判定！　スキルレベル：" + (skill) + "　フラグ：" + (flag) + "　目標値：" + (target);
      $b = self.$getRollResult(skill), $a = Opal.to_ary($b), (total = ($a[0] == null ? nil : $a[0])), (rollText = ($a[1] == null ? nil : $a[1])), $b;
      result = $rb_plus(result, "" + " ＞ " + (total) + "[" + (rollText) + "] ＞ 判定値：" + (total));
      success = self.$getSuccess(total, target);
      result = $rb_plus(result, "" + " ＞ " + (success));
      result = $rb_plus(result, self.$getCheckFlagResult(total, flag));
      return result;
    }, TMP_DetatokoSaga_checkRoll_6.$$arity = 1);
    
    Opal.defn(self, '$getRollResult', TMP_DetatokoSaga_getRollResult_8 = function $$getRollResult(skill) {
      var TMP_7, self = this, diceCount = nil, dice = nil, diceText = nil, total = nil;

      
      diceCount = $rb_plus(skill, 1);
      if (skill['$=='](0)) {
        diceCount = 3};
      dice = [];
      $send(diceCount, 'times', [], (TMP_7 = function(i){var self = TMP_7.$$s || this, $a, $b;
if (i == null) i = nil;
      return $b = self.$roll(1, 6), $a = Opal.to_ary($b), dice['$[]='](i, ($a[0] == null ? nil : $a[0])), $b}, TMP_7.$$s = self, TMP_7.$$arity = 1, TMP_7));
      diceText = dice.$join(",");
      dice = dice.$sort();
      if ($truthy(skill['$!='](0))) {
        dice = dice.$reverse()};
      total = $rb_plus(dice['$[]'](0), dice['$[]'](1));
      return [total, diceText];
    }, TMP_DetatokoSaga_getRollResult_8.$$arity = 1);
    
    Opal.defn(self, '$getSuccess', TMP_DetatokoSaga_getSuccess_9 = function $$getSuccess(check, target) {
      var self = this;

      
      if ($truthy($rb_ge(check, target))) {
        return "目標値以上！【成功】"};
      return "目標値未満…【失敗】";
    }, TMP_DetatokoSaga_getSuccess_9.$$arity = 2);
    
    Opal.defn(self, '$getCheckFlagResult', TMP_DetatokoSaga_getCheckFlagResult_10 = function $$getCheckFlagResult(total, flag) {
      var self = this, willText = nil, result = nil;

      
      if ($truthy($rb_gt(total, flag))) {
        return ""};
      willText = self.$getDownWill(flag);
      result = "" + "、フラグ以下！【気力" + (willText) + "点減少】";
      result = $rb_plus(result, "【判定値変更不可】");
      return result;
    }, TMP_DetatokoSaga_getCheckFlagResult_10.$$arity = 2);
    
    Opal.defn(self, '$getDownWill', TMP_DetatokoSaga_getDownWill_11 = function $$getDownWill(flag) {
      var $a, $b, self = this, dice = nil;

      
      if ($truthy($rb_ge(flag, 10))) {
        return "6"};
      $b = self.$roll(1, 6), $a = Opal.to_ary($b), (dice = ($a[0] == null ? nil : $a[0])), $b;
      return "" + "1D6->" + (dice);
    }, TMP_DetatokoSaga_getDownWill_11.$$arity = 1);
    
    Opal.defn(self, '$checkJudgeValue', TMP_DetatokoSaga_checkJudgeValue_12 = function $$checkJudgeValue(string) {
      var $a, $b, self = this, skill = nil, flag = nil, operator = nil, value = nil, result = nil, modifyText = nil, total = nil, rollText = nil, totalResult = nil;

      
      self.$debug("checkJudgeValue begin string", string);
      if ($truthy(/^(\d+)JD(\d+)?(([+]|[-]|[\/])(\d+))?$/i['$=~'](string))) {
        } else {
        return ""
      };
      skill = Opal.const_get_relative($nesting, 'Regexp').$last_match(1).$to_i();
      flag = Opal.const_get_relative($nesting, 'Regexp').$last_match(2).$to_i();
      operator = Opal.const_get_relative($nesting, 'Regexp').$last_match(4);
      value = Opal.const_get_relative($nesting, 'Regexp').$last_match(5).$to_i();
      result = "" + "判定！　スキルレベル：" + (skill) + "　フラグ：" + (flag);
      modifyText = self.$getModifyText(operator, value);
      if ($truthy(modifyText['$empty?']())) {
        } else {
        result = $rb_plus(result, "" + "　修正値：" + (modifyText))
      };
      $b = self.$getRollResult(skill), $a = Opal.to_ary($b), (total = ($a[0] == null ? nil : $a[0])), (rollText = ($a[1] == null ? nil : $a[1])), $b;
      result = $rb_plus(result, "" + " ＞ " + (total) + "[" + (rollText) + "]" + (modifyText));
      totalResult = self.$getTotalResultValue(total, value, operator);
      result = $rb_plus(result, "" + " ＞ " + (totalResult));
      result = $rb_plus(result, self.$getCheckFlagResult(total, flag));
      return result;
    }, TMP_DetatokoSaga_checkJudgeValue_12.$$arity = 1);
    
    Opal.defn(self, '$getModifyText', TMP_DetatokoSaga_getModifyText_13 = function $$getModifyText(operator, value) {
      var self = this, operatorText = nil, $case = nil;

      
      if (value['$=='](0)) {
        return ""};
      operatorText = (function() {$case = operator;
      if ("+"['$===']($case)) {return "＋"}
      else if ("-"['$===']($case)) {return "－"}
      else if ("/"['$===']($case)) {return "÷"}
      else {return ""}})();
      return "" + (operatorText) + (value);
    }, TMP_DetatokoSaga_getModifyText_13.$$arity = 2);
    
    Opal.defn(self, '$getTotalResultValue', TMP_DetatokoSaga_getTotalResultValue_14 = function $$getTotalResultValue(total, value, operator) {
      var self = this, $case = nil;

      return (function() {$case = operator;
      if ("+"['$===']($case)) {return "" + (total) + "+" + (value) + " ＞ 判定値：" + ($rb_plus(total, value))}
      else if ("-"['$===']($case)) {return "" + (total) + "-" + (value) + " ＞ 判定値：" + ($rb_minus(total, value))}
      else if ("/"['$===']($case)) {return self.$getTotalResultValueWhenSlash(total, value)}
      else {return "" + "判定値：" + (total)}})()
    }, TMP_DetatokoSaga_getTotalResultValue_14.$$arity = 3);
    
    Opal.defn(self, '$getTotalResultValueWhenSlash', TMP_DetatokoSaga_getTotalResultValueWhenSlash_15 = function $$getTotalResultValueWhenSlash(total, value) {
      var self = this, quotient = nil, result = nil;

      
      if (value['$=='](0)) {
        return "0では割れません"};
      quotient = $rb_divide($rb_times(1.0, total), value).$ceil();
      result = "" + (total) + "÷" + (value) + " ＞ 判定値：" + (quotient);
      return result;
    }, TMP_DetatokoSaga_getTotalResultValueWhenSlash_15.$$arity = 2);
    
    Opal.defn(self, '$rollTableCommand', TMP_DetatokoSaga_rollTableCommand_16 = function $$rollTableCommand(command) {
      var $a, $b, self = this, result = nil, name = nil, text = nil, total = nil, $case = nil;

      
      command = command.$upcase();
      result = [];
      self.$debug("rollDiceCommand command", command);
      name = "";
      text = "";
      total = 0;
      $case = command.$upcase();
      if ("SST"['$===']($case) || "StrengthStigmaTable".$upcase()['$===']($case)) {$b = self.$choiceStrengthStigmaTable(), $a = Opal.to_ary($b), (name = ($a[0] == null ? nil : $a[0])), (text = ($a[1] == null ? nil : $a[1])), (total = ($a[2] == null ? nil : $a[2])), $b}
      else if ("WST"['$===']($case) || "WillStigmaTable".$upcase()['$===']($case)) {$b = self.$choiceWillStigmaTable(), $a = Opal.to_ary($b), (name = ($a[0] == null ? nil : $a[0])), (text = ($a[1] == null ? nil : $a[1])), (total = ($a[2] == null ? nil : $a[2])), $b}
      else if ("SBET"['$===']($case) || "StrengthBadEndTable".$upcase()['$===']($case)) {$b = self.$choiceStrengthBadEndTable(), $a = Opal.to_ary($b), (name = ($a[0] == null ? nil : $a[0])), (text = ($a[1] == null ? nil : $a[1])), (total = ($a[2] == null ? nil : $a[2])), $b}
      else if ("WBET"['$===']($case) || "WillBadEndTable".$upcase()['$===']($case)) {$b = self.$choiceWillBadEndTable(), $a = Opal.to_ary($b), (name = ($a[0] == null ? nil : $a[0])), (text = ($a[1] == null ? nil : $a[1])), (total = ($a[2] == null ? nil : $a[2])), $b}
      else {return nil};
      result = "" + (name) + "(" + (total) + ") ＞ " + (text);
      return result;
    }, TMP_DetatokoSaga_rollTableCommand_16.$$arity = 1);
    
    Opal.defn(self, '$choiceStrengthStigmaTable', TMP_DetatokoSaga_choiceStrengthStigmaTable_17 = function $$choiceStrengthStigmaTable() {
      var $a, $b, self = this, name = nil, table = nil, text = nil, total = nil;

      
      name = "体力烙印表";
      table = ["あなたは【烙印】を２つ受ける。この表をさらに２回振って受ける【烙印】を決める（その結果、再びこの出目が出ても【烙印】は増えない）。", "【痛手】手負い傷を負った。何とか戦えているが……。", "【流血】血があふれ出し、目がかすむ……。", "【衰弱】体が弱り、その心さえも萎えてしまいそうだ……。", "【苦悶】痛みと苦しみ、情けなさ。目に涙がにじむ。", "【衝撃】吹き飛ばされ、壁や樹木にめりこむ。早く起き上がらねば。", "【疲労】あなたの顔に疲労の色が強まる……この戦いがつらくなってきた。", "【怒号】うっとうしい攻撃に怒りの叫びを放つ。怒りが戦いを迷わせるか？", "【負傷】手傷を負わされた……。", "【軽症】あなたの肌に傷が残った。これだけなら何ということもない。", "奇跡的にあなたは【烙印】を受けなかった。"];
      $b = self.$get_table_by_2d6(table), $a = Opal.to_ary($b), (text = ($a[0] == null ? nil : $a[0])), (total = ($a[1] == null ? nil : $a[1])), $b;
      return [name, text, total];
    }, TMP_DetatokoSaga_choiceStrengthStigmaTable_17.$$arity = 0);
    
    Opal.defn(self, '$choiceWillStigmaTable', TMP_DetatokoSaga_choiceWillStigmaTable_18 = function $$choiceWillStigmaTable() {
      var $a, $b, self = this, name = nil, table = nil, text = nil, total = nil;

      
      name = "気力烙印表";
      table = ["あなたは【烙印】を２つ受ける。この表をさらに２回振って受ける【烙印】を決める（その結果、再びこの出目が出ても【烙印】は増えない）。", "【絶望】どうしようもない状況。希望は失われ……膝を付くことしかできない。", "【号泣】あまりの理不尽に、子供のように泣き叫ぶことしかできない。", "【後悔】こんなはずじゃなかったのに。しかし現実は非情だった。", "【恐怖】恐怖に囚われてしまった！敵が、己の手が、恐ろしくてならない！", "【葛藤】本当にこれでいいのか？何度も自身への問いかけが起こる……。", "【憎悪】怒りと憎しみに囚われたあなたは、本来の力を発揮できるだろうか？", "【呆然】これは現実なのか？ぼんやりとしながらあなたは考える。", "【迷い】迷いを抱いてしまった。それは戦う意志を鈍らせるだろうか？", "【悪夢】これから時折、あなたはこの時を悪夢に見ることだろう。", "奇跡的にあなたは【烙印】を受けなかった。"];
      $b = self.$get_table_by_2d6(table), $a = Opal.to_ary($b), (text = ($a[0] == null ? nil : $a[0])), (total = ($a[1] == null ? nil : $a[1])), $b;
      return [name, text, total];
    }, TMP_DetatokoSaga_choiceWillStigmaTable_18.$$arity = 0);
    
    Opal.defn(self, '$choiceStrengthBadEndTable', TMP_DetatokoSaga_choiceStrengthBadEndTable_19 = function $$choiceStrengthBadEndTable() {
      var $a, $b, self = this, name = nil, table = nil, text = nil, total = nil;

      
      name = "体力バッドエンド表";
      table = ["【死亡】あなたは死んだ。次のセッションに参加するには、クラス１つを『モンスター』か『暗黒』にクラスチェンジしなくてはいけない。", "【命乞】あなたは恐怖に駆られ、命乞いをしてしまった！次のセッション開始時に、クラス１つが『ザコ』に変更される！", "【忘却】あなたは記憶を失い、ぼんやりと立ち尽くす。次のセッションに参加するには、クラス１つを変更しなくてはならない。", "【悲劇】あなたの攻撃は敵ではなく味方を撃った！全てが終わるまであなたは立ち尽くしていた。任意の味方の【体力】を１Ｄ６点減少させる。", "【暴走】あなたは正気を失い、衝動のまま暴走する！同じシーンにいる全員の【体力】を１Ｄ６点減少させる。", "【転落】あなたは断崖絶壁から転落した。", "【虜囚】あなたは敵に囚われた。", "【逃走】あなたは恐れをなし、仲間を見捨てて逃げ出した。", "【重症】あなたはどうしようもない痛手を負い、倒れた。", "【気絶】あなたは気を失った。そして目覚めれば全てが終わっていた。", "それでもまだ立ち上がる！あなたはバッドエンドを迎えなかった。体力の【烙印】を１つ打ち消してよい。"];
      $b = self.$get_table_by_2d6(table), $a = Opal.to_ary($b), (text = ($a[0] == null ? nil : $a[0])), (total = ($a[1] == null ? nil : $a[1])), $b;
      return [name, text, total];
    }, TMP_DetatokoSaga_choiceStrengthBadEndTable_19.$$arity = 0);
    return (Opal.defn(self, '$choiceWillBadEndTable', TMP_DetatokoSaga_choiceWillBadEndTable_20 = function $$choiceWillBadEndTable() {
      var $a, $b, self = this, name = nil, table = nil, text = nil, total = nil;

      
      name = "気力バッドエンド表";
      table = ["【自害】あなたは自ら死を選んだ。次のセッションに参加するには、クラス１つを『暗黒』にクラスチェンジしなくてはいけない。", "【堕落】あなたは心の中の闇に飲まれた。次のセッション開始時に、クラス１つが『暗黒』か『モンスター』に変更される！", "【隷属】あなたは敵の言うことに逆らえない。次のセッションであなたのスタンスは『従属』になる。", "【裏切】裏切りの衝動。任意の味方の【体力】を１Ｄ６点減少させ、その場から逃げ出す。", "【暴走】あなたは正気を失い、衝動のまま暴走する！同じシーンにいる全員の【体力】を１Ｄ６点減少させる。", "【呪い】心の闇が顕在化したのか。敵の怨嗟か。呪いに蝕まれたあなたは、のたうちまわることしかできない。", "【虜囚】あなたは敵に囚われ、その場から連れ去られる。", "【逃走】あなたは恐れをなし、仲間を見捨てて逃げ出した。", "【放心】あなたはただぼんやりと立ち尽くすしかなかった。我に返った時、全ては終わっていた。", "【気絶】あなたは気を失った。そして目覚めれば全てが終わっていた。", "それでもまだ諦めない！あなたはバッドエンドを迎えなかった。あなたは気力の【烙印】を１つ打ち消してよい。"];
      $b = self.$get_table_by_2d6(table), $a = Opal.to_ary($b), (text = ($a[0] == null ? nil : $a[0])), (total = ($a[1] == null ? nil : $a[1])), $b;
      return [name, text, total];
    }, TMP_DetatokoSaga_choiceWillBadEndTable_20.$$arity = 0), nil) && 'choiceWillBadEndTable';
  })($nesting[0], Opal.const_get_relative($nesting, 'DiceBot'), $nesting)
})(Opal);

/* Generated by Opal 0.11.4 */
(function(Opal) {
  var self = Opal.top, $nesting = [], nil = Opal.nil, $breaker = Opal.breaker, $slice = Opal.slice;

  Opal.add_stubs(['$exit']);
  return Opal.const_get_relative($nesting, 'Kernel').$exit()
})(Opal);
