import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { DxValidationGroupComponent } from 'devextreme-angular';
import { PermissionService } from 'src/app/shared';
import { GroupService } from 'src/app/shared/services/group.service';

@Component({
  selector: 'app-form-permission-detail',
  templateUrl: './form-permission-detail.component.html',
  styleUrls: ['./form-permission-detail.component.scss']
})
export class FormPermissionDetailComponent implements OnInit {

  @ViewChild('validationEntity', {static: false}) validationEntity!: DxValidationGroupComponent; 
  @Input() entity : any = {};  
  @Input() listData: any[]=[];
  @Input() state = 'detail';
  existName = false;

  constructor(
    
  ) { 
    this.validationAsync = this.validationAsync.bind(this);
  }

  ngOnInit(): void {
    
  }
  async validationAsync(){
    
  }

}
