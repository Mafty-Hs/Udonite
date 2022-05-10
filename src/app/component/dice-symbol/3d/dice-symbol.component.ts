import { animate, keyframes, style, transition, trigger } from '@angular/animations';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { DiceSymbol } from '@udonarium/dice-symbol';
import { DiceSymbolComponentTemplate } from 'component/dice-symbol/dice-symbol.template';

@Component({
  selector: 'dice-symbol',
  templateUrl: './dice-symbol.component.html',
  styleUrls: ['../dice-symbol.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('diceRoll', [
      transition('* => active', [
        animate('800ms ease', keyframes([
          style({ transform: 'scale3d(0.8, 0.8, 0.8) rotateZ(-0deg)', offset: 0 }),
          style({ transform: 'scale3d(1.2, 1.2, 1.2) rotateZ(-360deg)', offset: 0.5 }),
          style({ transform: 'scale3d(0.75, 0.75, 0.75) rotateZ(-520deg)', offset: 0.75 }),
          style({ transform: 'scale3d(1.125, 1.125, 1.125) rotateZ(-630deg)', offset: 0.875 }),
          style({ transform: 'scale3d(1.0, 1.0, 1.0) rotateZ(-720deg)', offset: 1.0 })
        ]))
      ])
    ]),
    trigger('coinFlip', [
      transition('* => active', [
        animate('800ms ease-out', keyframes([
          style({ transform: 'scale3d(0.8, 0.8, 0.8) translateY(0%) rotateX(60deg) rotateX(-0deg) rotateY(-0deg)', offset: 0 }),
          style({ transform: 'scale3d(1.2, 1.2, 1.2)  translateY(-28%) rotateX(60deg) rotateX(-360deg) rotateY(-360deg)', offset: 0.5 }),
          style({ transform: 'scale3d(0.75, 0.75, 0.75) translateY(-40%) rotateX(60deg) rotateX(-520deg) rotateY(-520deg)', offset: 0.75 }),
          style({ transform: 'scale3d(1.125, 1.125, 1.125) translateY(-28%) rotateX(60deg) rotateX(-630deg) rotateY(-630deg)', offset: 0.875 }),
          style({ transform: 'scale3d(1.0, 1.0, 1.0) translateY(0%) rotateX(60deg) rotateX(-720deg) rotateY(-720deg)', offset: 1.0 })
        ]))
      ])
    ]),
    trigger('diceRollNameTag', [
      transition('* => active', [
        animate('800ms ease', keyframes([
          style({ transform: 'scale3d(0.8, 0.8, 0.8) rotateY(0deg)', offset: 0 }),
          style({ transform: 'scale3d(1.2, 1.2, 1.2) rotateY(360deg)', offset: 0.5 }),
          style({ transform: 'scale3d(0.75, 0.75, 0.75) rotateY(520deg)', offset: 0.75 }),
          style({ transform: 'scale3d(1.125, 1.125, 1.125) rotateY(630deg)', offset: 0.875 }),
          style({ transform: 'scale3d(1.0, 1.0, 1.0) rotateY(720deg)', offset: 1.0 })
        ]))
      ])
    ]),
    trigger('changeFace', [
      transition(':increment,:decrement', [
        animate('200ms ease', keyframes([
          style({ transform: 'scale3d(0.8, 0.8, 0.8) rotateZ(0deg)', offset: 0 }),
          style({ transform: 'scale3d(1.0, 1.0, 1.0) rotateZ(-360deg)', offset: 1.0 })
        ]))
      ])
    ]),
    trigger('changeFaceCoin', [
      transition(':increment,:decrement', [
        animate('200ms ease', keyframes([
          style({ transform: 'scale3d(0.8, 0.8, 0.8) rotateX(0deg)', offset: 0 }),
          style({ transform: 'scale3d(1.0, 1.0, 1.0) rotateX(-720deg)', offset: 1.0 })
        ]))
      ])
    ]),
    trigger('changeFaceNameTag', [
      transition(':increment,:decrement', [
        animate('200ms ease', keyframes([
          style({ transform: 'scale3d(0.8, 0.8, 0.8) rotateY(0deg)', offset: 0 }),
          style({ transform: 'scale3d(1.0, 1.0, 1.0) rotateY(360deg)', offset: 1.0 })
        ]))
      ])
    ]),
    trigger('bounceInOut', [
      transition('void => *', [
        animate('600ms ease', keyframes([
          style({ transform: 'scale3d(0, 0, 0)', offset: 0 }),
          style({ transform: 'scale3d(1.5, 1.5, 1.5)', offset: 0.5 }),
          style({ transform: 'scale3d(0.75, 0.75, 0.75)', offset: 0.75 }),
          style({ transform: 'scale3d(1.125, 1.125, 1.125)', offset: 0.875 }),
          style({ transform: 'scale3d(1.0, 1.0, 1.0)', offset: 1.0 })
        ]))
      ]),
      transition('* => void', [
        animate(100, style({ transform: 'scale3d(0, 0, 0)' }))
      ])
    ])
  ]
})
export class DiceSymbolComponent extends DiceSymbolComponentTemplate implements OnInit, OnDestroy, AfterViewInit {
  @Input() diceSymbol: DiceSymbol = null;
  @Input() is3D: boolean = false;

  ngOnInit():void {
    super.ngOnInit()
  }

  ngAfterViewInit():void {
    super.ngAfterViewInit();
  }

  ngOnDestroy():void {
    super.ngOnDestroy();
  }

}
