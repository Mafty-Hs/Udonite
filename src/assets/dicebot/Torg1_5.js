/* Generated by Opal 0.11.4 */
(function(Opal) {
  function $rb_gt(lhs, rhs) {
    return (typeof(lhs) === 'number' && typeof(rhs) === 'number') ? lhs > rhs : lhs['$>'](rhs);
  }
  function $rb_plus(lhs, rhs) {
    return (typeof(lhs) === 'number' && typeof(rhs) === 'number') ? lhs + rhs : lhs['$+'](rhs);
  }
  function $rb_lt(lhs, rhs) {
    return (typeof(lhs) === 'number' && typeof(rhs) === 'number') ? lhs < rhs : lhs['$<'](rhs);
  }
  function $rb_minus(lhs, rhs) {
    return (typeof(lhs) === 'number' && typeof(rhs) === 'number') ? lhs - rhs : lhs['$-'](rhs);
  }
  function $rb_le(lhs, rhs) {
    return (typeof(lhs) === 'number' && typeof(rhs) === 'number') ? lhs <= rhs : lhs['$<='](rhs);
  }
  function $rb_divide(lhs, rhs) {
    return (typeof(lhs) === 'number' && typeof(rhs) === 'number') ? lhs / rhs : lhs['$/'](rhs);
  }
  var self = Opal.top, $nesting = [], nil = Opal.nil, $breaker = Opal.breaker, $slice = Opal.slice, $klass = Opal.klass, $send = Opal.send, $truthy = Opal.truthy;

  Opal.add_stubs(['$setPrefixes', '$gsub', '$last_match', '$torg_check', '$=~', '$debug', '$to_i', '$parren_killer', '$torg_dice', '$get_torg_bonus', '$>', '$+', '$to_s', '$!=', '$roll', '$shift', '$empty?', '$==', '$upcase', '$===', '$get_torg_success_level', '$get_torg_interaction_result_intimidate_test', '$get_torg_interaction_result_taunt_trick', '$get_torg_interaction_result_maneuver', '$get_torg_damage_ords', '$get_torg_damage_posibility', '$get_torg_bonus_text', '$get_torg_table_result', '$each', '$[]', '$get_torg_damage', '$<', '$-', '$length', '$<=', '$/', '$split', '$join', '$getTorgBonusOutputTextWhenModDefined']);
  return (function($base, $super, $parent_nesting) {
    function $Torg(){};
    var self = $Torg = $klass($base, $super, 'Torg', $Torg);

    var def = self.$$proto, $nesting = [self].concat($parent_nesting), TMP_Torg_initialize_1, TMP_Torg_gameName_2, TMP_Torg_gameType_3, TMP_Torg_getHelpMessage_4, TMP_Torg_changeText_6, TMP_Torg_dice_command_xRn_7, TMP_Torg_torg_check_8, TMP_Torg_torg_dice_9, TMP_Torg_rollDiceCommand_10, TMP_Torg_get_torg_success_level_11, TMP_Torg_get_torg_interaction_result_intimidate_test_12, TMP_Torg_get_torg_interaction_result_taunt_trick_13, TMP_Torg_get_torg_interaction_result_maneuver_14, TMP_Torg_get_torg_table_result_16, TMP_Torg_get_torg_damage_ords_17, TMP_Torg_get_torg_damage_posibility_18, TMP_Torg_get_torg_damage_19, TMP_Torg_get_torg_bonus_text_20, TMP_Torg_getTorgBonusOutputTextWhenModDefined_21, TMP_Torg_get_torg_bonus_22;

    
    self.$setPrefixes(["(TG.*|RT.*|Result.*|IT.*|Initimidate.*|TT.*|Taunt.*|Trick.*|CT.*|MT.*|Maneuver.*|ODT.*|ords.*|odamage.*|DT.*|damage.*|BT.*|bonus.*|total.*)"]);
    
    Opal.defn(self, '$initialize', TMP_Torg_initialize_1 = function $$initialize() {
      var self = this, $iter = TMP_Torg_initialize_1.$$p, $yield = $iter || nil, $zuper = nil, $zuper_i = nil, $zuper_ii = nil;

      if ($iter) TMP_Torg_initialize_1.$$p = null;
      // Prepare super implicit arguments
      for($zuper_i = 0, $zuper_ii = arguments.length, $zuper = new Array($zuper_ii); $zuper_i < $zuper_ii; $zuper_i++) {
        $zuper[$zuper_i] = arguments[$zuper_i];
      }
      
      $send(self, Opal.find_super_dispatcher(self, 'initialize', TMP_Torg_initialize_1, false), $zuper, $iter);
      return (self.sendMode = 2);
    }, TMP_Torg_initialize_1.$$arity = 0);
    
    Opal.defn(self, '$gameName', TMP_Torg_gameName_2 = function $$gameName() {
      var self = this;

      return "トーグ"
    }, TMP_Torg_gameName_2.$$arity = 0);
    
    Opal.defn(self, '$gameType', TMP_Torg_gameType_3 = function $$gameType() {
      var self = this;

      return "TORG"
    }, TMP_Torg_gameType_3.$$arity = 0);
    
    Opal.defn(self, '$getHelpMessage', TMP_Torg_getHelpMessage_4 = function $$getHelpMessage() {
      var self = this;

      return "" + "・判定　(TGm)\n" + "　TORG専用の判定コマンドです。\n" + "　\"TG(技能基本値)\"でロールします。Rコマンドに読替されます。\n" + "　振り足しを自動で行い、20の出目が出たときには技能無し値も並記します。\n" + "・各種表　\"(表コマンド)(数値)\"で振ります。\n" + "　・一般結果表 成功度出力「RTx or RESULTx」\n" + "　・威圧/威嚇 対人行為結果表「ITx or INTIMIDATEx or TESTx」\n" + "　・挑発/トリック 対人行為結果表「TTx or TAUNTx or TRICKx or CTx」\n" + "　・間合い 対人行為結果表「MTx or MANEUVERx」\n" + "　・オーズ（一般人）ダメージ　「ODTx or ORDSx or ODAMAGEx」\n" + "　・ポシビリティー能力者ダメージ「DTx or DAMAGEx」\n" + "　・ボーナス表「BTx+y or BONUSx+y or TOTALx+y」 xは数値, yは技能基本値\n"
    }, TMP_Torg_getHelpMessage_4.$$arity = 0);
    
    Opal.defn(self, '$changeText', TMP_Torg_changeText_6 = function $$changeText(string) {
      var TMP_5, self = this;

      
      string = string.$gsub(/Result/i, "RT");
      string = string.$gsub(/(Intimidate|Test)/i, "IT");
      string = string.$gsub(/(Taunt|Trick|CT)/i, "TT");
      string = string.$gsub(/Maneuver/i, "MT");
      string = string.$gsub(/(ords|odamage)/i, "ODT");
      string = string.$gsub(/damage/i, "DT");
      string = string.$gsub(/(bonus|total)/i, "BT");
      string = $send(string, 'gsub', [/TG(\d+)/i], (TMP_5 = function(){var self = TMP_5.$$s || this;

      return "" + "1R20+" + (Opal.const_get_relative($nesting, 'Regexp').$last_match(1))}, TMP_5.$$s = self, TMP_5.$$arity = 0, TMP_5));
      string = string.$gsub(/TG/i, "1R20");
      return string;
    }, TMP_Torg_changeText_6.$$arity = 1);
    
    Opal.defn(self, '$dice_command_xRn', TMP_Torg_dice_command_xRn_7 = function $$dice_command_xRn(string, nick_e) {
      var self = this;

      return self.$torg_check(string, nick_e)
    }, TMP_Torg_dice_command_xRn_7.$$arity = 2);
    
    Opal.defn(self, '$torg_check', TMP_Torg_torg_check_8 = function $$torg_check(string, nick_e) {
      var $a, $b, self = this, output = nil, mod = nil, skilled = nil, unskilled = nil, dice_str = nil, sk_bonus = nil;

      
      output = "1";
      if ($truthy(/(^|\s)S?(1R20([+-]\d+)*)(\s|$)/i['$=~'](string))) {
        } else {
        return "1"
      };
      string = Opal.const_get_relative($nesting, 'Regexp').$last_match(2);
      mod = Opal.const_get_relative($nesting, 'Regexp').$last_match(3);
      self.$debug(mod);
      if ($truthy(mod)) {
        mod = self.$parren_killer("" + "(0" + (mod) + ")").$to_i()};
      self.$debug(mod);
      mod = mod.$to_i();
      $b = self.$torg_dice(), $a = Opal.to_ary($b), (skilled = ($a[0] == null ? nil : $a[0])), (unskilled = ($a[1] == null ? nil : $a[1])), (dice_str = ($a[2] == null ? nil : $a[2])), $b;
      sk_bonus = self.$get_torg_bonus(skilled);
      if ($truthy(mod)) {
        if ($truthy($rb_gt(mod, 0))) {
          output = "" + (sk_bonus) + "[" + (dice_str) + "]+" + (mod)
          } else {
          output = "" + (sk_bonus) + "[" + (dice_str) + "]" + (mod)
        }
        } else {
        output = "" + (sk_bonus) + "[" + (dice_str) + "]"
      };
      output = $rb_plus(output, $rb_plus(" ＞ ", $rb_plus(sk_bonus, mod).$to_s()));
      if ($truthy(skilled['$!='](unskilled))) {
        output = $rb_plus(output, $rb_plus($rb_plus("(技能無", $rb_plus(self.$get_torg_bonus(unskilled), mod).$to_s()), ")"))};
      output = "" + (nick_e) + ": (" + (string) + ") ＞ " + (output);
      return output;
    }, TMP_Torg_torg_check_8.$$arity = 2);
    
    Opal.defn(self, '$torg_dice', TMP_Torg_torg_dice_9 = function $$torg_dice() {
      var $a, self = this, isSkilledCritical = nil, isCritical = nil, skilled = nil, unskilled = nil, dice_str = nil, dummy = nil, dice_n = nil;

      
      isSkilledCritical = true;
      isCritical = true;
      skilled = 0;
      unskilled = 0;
      dice_str = "";
      while ($truthy(isSkilledCritical)) {
        
        dummy = self.$roll(1, 20, 0);
        dice_n = dummy.$shift();
        skilled = $rb_plus(skilled, dice_n);
        if ($truthy(isCritical)) {
          unskilled = $rb_plus(unskilled, dice_n)};
        if ($truthy(dice_str['$empty?']())) {
          } else {
          dice_str = $rb_plus(dice_str, ",")
        };
        dice_str = $rb_plus(dice_str, dice_n.$to_s());
        if (dice_n['$=='](20)) {
          isCritical = false
        } else if ($truthy(dice_n['$!='](10))) {
          
          isSkilledCritical = false;
          isCritical = false;};
      };
      return [skilled, unskilled, dice_str];
    }, TMP_Torg_torg_dice_9.$$arity = 0);
    
    Opal.defn(self, '$rollDiceCommand', TMP_Torg_rollDiceCommand_10 = function $$rollDiceCommand(command) {
      var $a, $b, self = this, string = nil, output = nil, ttype = nil, value = nil, type = nil, num = nil, $case = nil;

      
      string = command.$upcase();
      output = "1";
      ttype = "";
      value = 0;
      if ($truthy(/([RITMDB]T)(\d+([\+\-]\d+)*)/i['$=~'](string))) {
        } else {
        return "1"
      };
      type = Opal.const_get_relative($nesting, 'Regexp').$last_match(1);
      num = Opal.const_get_relative($nesting, 'Regexp').$last_match(2);
      $case = type;
      if ("RT"['$===']($case)) {
      value = self.$parren_killer("" + "(0" + (num) + ")").$to_i();
      output = self.$get_torg_success_level(value);
      ttype = "一般結果";}
      else if ("IT"['$===']($case)) {
      value = self.$parren_killer("" + "(0" + (num) + ")").$to_i();
      output = self.$get_torg_interaction_result_intimidate_test(value);
      ttype = "威圧/威嚇";}
      else if ("TT"['$===']($case)) {
      value = self.$parren_killer("" + "(0" + (num) + ")").$to_i();
      output = self.$get_torg_interaction_result_taunt_trick(value);
      ttype = "挑発/トリック";}
      else if ("MT"['$===']($case)) {
      value = self.$parren_killer("" + "(0" + (num) + ")").$to_i();
      output = self.$get_torg_interaction_result_maneuver(value);
      ttype = "間合い";}
      else if ("DT"['$===']($case)) {
      value = self.$parren_killer("" + "(0" + (num) + ")").$to_i();
      if ($truthy(string['$=~'](/ODT/i))) {
        
        output = self.$get_torg_damage_ords(value);
        ttype = "オーズダメージ";
        } else {
        
        output = self.$get_torg_damage_posibility(value);
        ttype = "ポシビリティ能力者ダメージ";
      };}
      else if ("BT"['$===']($case)) {
      $b = self.$get_torg_bonus_text(num), $a = Opal.to_ary($b), (output = ($a[0] == null ? nil : $a[0])), (value = ($a[1] == null ? nil : $a[1])), $b;
      ttype = "ボーナス";};
      if ($truthy(ttype['$!='](""))) {
        output = "" + (ttype) + "表[" + (value) + "] ＞ " + (output)};
      return output;
    }, TMP_Torg_rollDiceCommand_10.$$arity = 1);
    
    Opal.defn(self, '$get_torg_success_level', TMP_Torg_get_torg_success_level_11 = function $$get_torg_success_level(value) {
      var self = this, success_table = nil;

      
      success_table = [[0, "ぎりぎり"], [1, "ふつう"], [3, "まあよい"], [7, "かなりよい"], [12, "すごい"]];
      return self.$get_torg_table_result(value, success_table);
    }, TMP_Torg_get_torg_success_level_11.$$arity = 1);
    
    Opal.defn(self, '$get_torg_interaction_result_intimidate_test', TMP_Torg_get_torg_interaction_result_intimidate_test_12 = function $$get_torg_interaction_result_intimidate_test(value) {
      var self = this, interaction_results_table = nil;

      
      interaction_results_table = [[0, "技能なし"], [5, "萎縮"], [10, "逆転負け"], [15, "モラル崩壊"], [17, "プレイヤーズコール"]];
      return self.$get_torg_table_result(value, interaction_results_table);
    }, TMP_Torg_get_torg_interaction_result_intimidate_test_12.$$arity = 1);
    
    Opal.defn(self, '$get_torg_interaction_result_taunt_trick', TMP_Torg_get_torg_interaction_result_taunt_trick_13 = function $$get_torg_interaction_result_taunt_trick(value) {
      var self = this, interaction_results_table = nil;

      
      interaction_results_table = [[0, "技能なし"], [5, "萎縮"], [10, "逆転負け"], [15, "高揚／逆転負け"], [17, "プレイヤーズコール"]];
      return self.$get_torg_table_result(value, interaction_results_table);
    }, TMP_Torg_get_torg_interaction_result_taunt_trick_13.$$arity = 1);
    
    Opal.defn(self, '$get_torg_interaction_result_maneuver', TMP_Torg_get_torg_interaction_result_maneuver_14 = function $$get_torg_interaction_result_maneuver(value) {
      var self = this, interaction_results_table = nil;

      
      interaction_results_table = [[0, "技能なし"], [5, "疲労"], [10, "萎縮／疲労"], [15, "逆転負け／疲労"], [17, "プレイヤーズコール"]];
      return self.$get_torg_table_result(value, interaction_results_table);
    }, TMP_Torg_get_torg_interaction_result_maneuver_14.$$arity = 1);
    
    Opal.defn(self, '$get_torg_table_result', TMP_Torg_get_torg_table_result_16 = function $$get_torg_table_result(value, table) {
      var TMP_15, self = this, output = nil;

      
      output = "1";
      (function(){var $brk = Opal.new_brk(); try {return $send(table, 'each', [], (TMP_15 = function(item){var self = TMP_15.$$s || this, item_index = nil;
if (item == null) item = nil;
      
        item_index = item['$[]'](0);
        if ($truthy($rb_gt(item_index, value))) {
          
          Opal.brk(nil, $brk)};
        return (output = item['$[]'](1));}, TMP_15.$$s = self, TMP_15.$$brk = $brk, TMP_15.$$arity = 1, TMP_15))
      } catch (err) { if (err === $brk) { return err.$v } else { throw err } }})();
      return output;
    }, TMP_Torg_get_torg_table_result_16.$$arity = 2);
    
    Opal.defn(self, '$get_torg_damage_ords', TMP_Torg_get_torg_damage_ords_17 = function $$get_torg_damage_ords(value) {
      var self = this, damage_table_ords = nil;

      
      damage_table_ords = [[0, "1"], [1, "O1"], [2, "K1"], [3, "O2"], [4, "O3"], [5, "K3"], [6, "転倒 K／O4"], [7, "転倒 K／O5"], [8, "1レベル負傷  K／O7"], [9, "1レベル負傷  K／O9"], [10, "1レベル負傷  K／O10"], [11, "2レベル負傷  K／O11"], [12, "2レベル負傷  KO12"], [13, "3レベル負傷  KO13"], [14, "3レベル負傷  KO14"], [15, "4レベル負傷  KO15"]];
      return self.$get_torg_damage(value, 4, "レベル負傷  KO15", damage_table_ords);
    }, TMP_Torg_get_torg_damage_ords_17.$$arity = 1);
    
    Opal.defn(self, '$get_torg_damage_posibility', TMP_Torg_get_torg_damage_posibility_18 = function $$get_torg_damage_posibility(value) {
      var self = this, damage_table_posibility = nil;

      
      damage_table_posibility = [[0, "1"], [1, "1"], [2, "O1"], [3, "K2"], [4, "2"], [5, "O2"], [6, "転倒 O2"], [7, "転倒 K2"], [8, "転倒 K2"], [9, "1レベル負傷  K3"], [10, "1レベル負傷  K4"], [11, "1レベル負傷  O4"], [12, "1レベル負傷  K5"], [13, "2レベル負傷  O4"], [14, "2レベル負傷  KO5"], [15, "3レベル負傷  KO5"]];
      return self.$get_torg_damage(value, 3, "レベル負傷  KO5", damage_table_posibility);
    }, TMP_Torg_get_torg_damage_posibility_18.$$arity = 1);
    
    Opal.defn(self, '$get_torg_damage', TMP_Torg_get_torg_damage_19 = function $$get_torg_damage(value, maxDamage, maxDamageString, damage_table) {
      var self = this, table_max_value = nil, over_kill_damage = nil;

      
      if ($truthy($rb_lt(value, 0))) {
        return "1"};
      table_max_value = $rb_minus(damage_table.$length(), 1);
      if ($truthy($rb_le(value, table_max_value))) {
        return self.$get_torg_table_result(value, damage_table)};
      over_kill_damage = $rb_divide($rb_minus(value, table_max_value), 2).$to_i();
      return $rb_plus($rb_plus("", $rb_plus(over_kill_damage, maxDamage).$to_s()), maxDamageString);
    }, TMP_Torg_get_torg_damage_19.$$arity = 4);
    
    Opal.defn(self, '$get_torg_bonus_text', TMP_Torg_get_torg_bonus_text_20 = function $$get_torg_bonus_text(num) {
      var self = this, val_arr = nil, value = nil, mod = nil, resultValue = nil, output = nil;

      
      val_arr = num.$split(/\+/);
      value = val_arr.$shift().$to_i();
      mod = self.$parren_killer("" + "(0" + (val_arr.$join("+")) + ")").$to_i();
      resultValue = self.$get_torg_bonus(value);
      self.$debug("TORG BT resultValue", resultValue);
      self.$debug("TORG BT mod", mod);
      if (mod['$=='](0)) {
        output = resultValue.$to_s()
        } else {
        
        output = self.$getTorgBonusOutputTextWhenModDefined(value, resultValue, mod);
        value = "" + (value) + "+" + (mod);
      };
      return [output, value];
    }, TMP_Torg_get_torg_bonus_text_20.$$arity = 1);
    
    Opal.defn(self, '$getTorgBonusOutputTextWhenModDefined', TMP_Torg_getTorgBonusOutputTextWhenModDefined_21 = function $$getTorgBonusOutputTextWhenModDefined(value, resultValue, mod) {
      var self = this;

      
      self.$debug("getTorgBonusOutputTextWhenModDefined value, mod", value, mod);
      if ($truthy($rb_gt(mod, 0))) {
        return "" + (resultValue) + "[" + (value) + "]+" + (mod) + " ＞ " + ($rb_plus(resultValue, mod))
        } else {
        
        self.$debug("resultValue", resultValue);
        self.$debug("mod", mod);
        return "" + (resultValue) + "[" + (value) + "]" + (mod) + " ＞ " + ($rb_plus(resultValue, mod));
      };
    }, TMP_Torg_getTorgBonusOutputTextWhenModDefined_21.$$arity = 3);
    return (Opal.defn(self, '$get_torg_bonus', TMP_Torg_get_torg_bonus_22 = function $$get_torg_bonus(value) {
      var self = this, bonus_table = nil, bonus = nil, over_value_bonus = nil;

      
      bonus_table = [[1, -12], [2, -10], [3, -8], [5, -5], [7, -2], [9, -1], [11, 0], [13, 1], [15, 2], [16, 3], [17, 4], [18, 5], [19, 6], [20, 7]];
      bonus = self.$get_torg_table_result(value, bonus_table);
      if ($truthy($rb_gt(value, 20))) {
        
        over_value_bonus = $rb_plus($rb_divide($rb_minus(value, 21), 5).$to_i(), 1);
        bonus = $rb_plus(bonus, over_value_bonus);};
      return bonus;
    }, TMP_Torg_get_torg_bonus_22.$$arity = 1), nil) && 'get_torg_bonus';
  })($nesting[0], Opal.const_get_relative($nesting, 'DiceBot'), $nesting)
})(Opal);

/* Generated by Opal 0.11.4 */
(function(Opal) {
  var self = Opal.top, $nesting = [], nil = Opal.nil, $breaker = Opal.breaker, $slice = Opal.slice;

  Opal.add_stubs(['$exit']);
  return Opal.const_get_relative($nesting, 'Kernel').$exit()
})(Opal);
Opal.loaded(["diceBot/Torg"]);
/* Generated by Opal 0.11.4 */
(function(Opal) {
  function $rb_lt(lhs, rhs) {
    return (typeof(lhs) === 'number' && typeof(rhs) === 'number') ? lhs < rhs : lhs['$<'](rhs);
  }
  function $rb_minus(lhs, rhs) {
    return (typeof(lhs) === 'number' && typeof(rhs) === 'number') ? lhs - rhs : lhs['$-'](rhs);
  }
  function $rb_le(lhs, rhs) {
    return (typeof(lhs) === 'number' && typeof(rhs) === 'number') ? lhs <= rhs : lhs['$<='](rhs);
  }
  function $rb_divide(lhs, rhs) {
    return (typeof(lhs) === 'number' && typeof(rhs) === 'number') ? lhs / rhs : lhs['$/'](rhs);
  }
  function $rb_plus(lhs, rhs) {
    return (typeof(lhs) === 'number' && typeof(rhs) === 'number') ? lhs + rhs : lhs['$+'](rhs);
  }
  function $rb_times(lhs, rhs) {
    return (typeof(lhs) === 'number' && typeof(rhs) === 'number') ? lhs * rhs : lhs['$*'](rhs);
  }
  var self = Opal.top, $nesting = [], nil = Opal.nil, $breaker = Opal.breaker, $slice = Opal.slice, $klass = Opal.klass, $truthy = Opal.truthy;

  Opal.add_stubs(['$require', '$setPrefixes', '$prefixes', '$get_torg_table_result', '$get_torg_damage', '$<', '$-', '$length', '$<=', '$to_i', '$/', '$+', '$*']);
  
  self.$require("diceBot/Torg");
  return (function($base, $super, $parent_nesting) {
    function $Torg1_5(){};
    var self = $Torg1_5 = $klass($base, $super, 'Torg1_5', $Torg1_5);

    var def = self.$$proto, $nesting = [self].concat($parent_nesting), TMP_Torg1_5_gameName_1, TMP_Torg1_5_gameType_2, TMP_Torg1_5_get_torg_success_level_3, TMP_Torg1_5_get_torg_interaction_result_intimidate_test_4, TMP_Torg1_5_get_torg_interaction_result_taunt_trick_5, TMP_Torg1_5_get_torg_interaction_result_maneuver_6, TMP_Torg1_5_get_torg_damage_ords_7, TMP_Torg1_5_get_torg_damage_posibility_8, TMP_Torg1_5_get_torg_damage_9;

    
    self.$setPrefixes(Opal.const_get_relative($nesting, 'Torg').$prefixes());
    
    Opal.defn(self, '$gameName', TMP_Torg1_5_gameName_1 = function $$gameName() {
      var self = this;

      return "トーグ1.5版"
    }, TMP_Torg1_5_gameName_1.$$arity = 0);
    
    Opal.defn(self, '$gameType', TMP_Torg1_5_gameType_2 = function $$gameType() {
      var self = this;

      return "TORG1.5"
    }, TMP_Torg1_5_gameType_2.$$arity = 0);
    
    Opal.defn(self, '$get_torg_success_level', TMP_Torg1_5_get_torg_success_level_3 = function $$get_torg_success_level(value) {
      var self = this, success_table = nil;

      
      success_table = [[0, "ぎりぎり"], [1, "ふつう"], [3, "まあよい"], [7, "かなりよい"], [12, "すごい"]];
      return self.$get_torg_table_result(value, success_table);
    }, TMP_Torg1_5_get_torg_success_level_3.$$arity = 1);
    
    Opal.defn(self, '$get_torg_interaction_result_intimidate_test', TMP_Torg1_5_get_torg_interaction_result_intimidate_test_4 = function $$get_torg_interaction_result_intimidate_test(value) {
      var self = this, interaction_results_table = nil;

      
      interaction_results_table = [[0, "萎縮"], [5, "技能なし"], [10, "逆転負け"], [15, "モラル崩壊"], [17, "プレイヤーズコール"]];
      return self.$get_torg_table_result(value, interaction_results_table);
    }, TMP_Torg1_5_get_torg_interaction_result_intimidate_test_4.$$arity = 1);
    
    Opal.defn(self, '$get_torg_interaction_result_taunt_trick', TMP_Torg1_5_get_torg_interaction_result_taunt_trick_5 = function $$get_torg_interaction_result_taunt_trick(value) {
      var self = this, interaction_results_table = nil;

      
      interaction_results_table = [[0, "萎縮"], [5, "技能なし"], [10, "逆転負け"], [15, "高揚／逆転負け"], [17, "プレイヤーズコール"]];
      return self.$get_torg_table_result(value, interaction_results_table);
    }, TMP_Torg1_5_get_torg_interaction_result_taunt_trick_5.$$arity = 1);
    
    Opal.defn(self, '$get_torg_interaction_result_maneuver', TMP_Torg1_5_get_torg_interaction_result_maneuver_6 = function $$get_torg_interaction_result_maneuver(value) {
      var self = this, interaction_results_table = nil;

      
      interaction_results_table = [[0, "疲労"], [5, "萎縮"], [10, "技能なし"], [15, "逆転負け／疲労"], [17, "プレイヤーズコール"]];
      return self.$get_torg_table_result(value, interaction_results_table);
    }, TMP_Torg1_5_get_torg_interaction_result_maneuver_6.$$arity = 1);
    
    Opal.defn(self, '$get_torg_damage_ords', TMP_Torg1_5_get_torg_damage_ords_7 = function $$get_torg_damage_ords(value) {
      var self = this, damage_table_ords = nil;

      
      damage_table_ords = [[0, "1"], [1, "O1"], [2, "K1"], [3, "O2"], [4, "K2"], [5, "転倒 O3"], [6, "転倒 K3"], [7, "転倒 K／O4"], [8, "1レベル負傷  KO4"], [9, "1レベル負傷  K／O5"], [10, "1レベル負傷  KO5"], [11, "2レベル負傷  K／O6"], [12, "2レベル負傷  KO6"], [13, "3レベル負傷  K／O7"], [14, "3レベル負傷  KO7"], [15, "4レベル負傷  KO8"]];
      return self.$get_torg_damage(value, 4, 8, damage_table_ords);
    }, TMP_Torg1_5_get_torg_damage_ords_7.$$arity = 1);
    
    Opal.defn(self, '$get_torg_damage_posibility', TMP_Torg1_5_get_torg_damage_posibility_8 = function $$get_torg_damage_posibility(value) {
      var self = this, damage_table_posibility = nil;

      
      damage_table_posibility = [[0, "1"], [1, "1"], [2, "O1"], [3, "K1"], [4, "2"], [5, "O2"], [6, "転倒 K2"], [7, "転倒 O3"], [8, "転倒 K3"], [9, "転倒 K／O3"], [10, "1レベル負傷  K／O4"], [11, "1レベル負傷  K／O4"], [12, "1レベル負傷  KO4"], [13, "2レベル負傷  K／O5"], [14, "2レベル負傷  KO5"], [15, "3レベル負傷  KO5"]];
      return self.$get_torg_damage(value, 3, 5, damage_table_posibility);
    }, TMP_Torg1_5_get_torg_damage_posibility_8.$$arity = 1);
    return (Opal.defn(self, '$get_torg_damage', TMP_Torg1_5_get_torg_damage_9 = function $$get_torg_damage(value, max_damage, max_shock, damage_table) {
      var self = this, table_max_value = nil, over_kill_value = nil, over_kill_damage = nil, over_kill_shock = nil;

      
      if ($truthy($rb_lt(value, 0))) {
        return "1"};
      table_max_value = $rb_minus(damage_table.$length(), 1);
      if ($truthy($rb_le(value, table_max_value))) {
        return self.$get_torg_table_result(value, damage_table)};
      over_kill_value = $rb_divide($rb_minus(value, table_max_value), 2).$to_i();
      over_kill_damage = $rb_plus(max_damage, $rb_times(over_kill_value, 1));
      over_kill_shock = $rb_plus(max_shock, $rb_times(over_kill_value, 1));
      return "" + (over_kill_damage) + "レベル負傷  KO" + (over_kill_shock);
    }, TMP_Torg1_5_get_torg_damage_9.$$arity = 4), nil) && 'get_torg_damage';
  })($nesting[0], Opal.const_get_relative($nesting, 'Torg'), $nesting);
})(Opal);

/* Generated by Opal 0.11.4 */
(function(Opal) {
  var self = Opal.top, $nesting = [], nil = Opal.nil, $breaker = Opal.breaker, $slice = Opal.slice;

  Opal.add_stubs(['$exit']);
  return Opal.const_get_relative($nesting, 'Kernel').$exit()
})(Opal);
