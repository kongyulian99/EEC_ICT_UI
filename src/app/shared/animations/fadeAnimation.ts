import {
  trigger,
  state,
  style,
  animate,
  transition,
  AnimationTriggerMetadata,
} from '@angular/animations';

export const fadeInOutAnimation: AnimationTriggerMetadata = trigger(
  'fadeInOut',
  [
    state('open', style({ height: '*'})),
    state('close', style({height: '0px', boxShadow: 'none'})),
    transition('* => *', [
      animate('100ms')
    ])
  ]
);