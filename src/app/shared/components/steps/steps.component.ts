import { Component, Input, OnInit } from '@angular/core';
import { StepInfo } from '../../models';

@Component({
  selector: 'app-steps',
  templateUrl: './steps.component.html',
  styleUrls: ['./steps.component.scss']
})
export class StepsComponent implements OnInit {

    @Input() status;
    @Input() data: StepInfo[] = [];
    constructor() { }
    ngOnInit(): void { }

}
