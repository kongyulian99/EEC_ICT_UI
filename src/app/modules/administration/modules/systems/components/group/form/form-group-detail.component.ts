import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { DxValidationGroupComponent } from 'devextreme-angular';
import { GroupService } from 'src/app/shared/services/group.service';

@Component({
  selector: 'app-form-group-detail',
  templateUrl: './form-group-detail.component.html',
  styleUrls: ['./form-group-detail.component.scss']
})
export class FormGroupDetailComponent implements OnInit {

  @ViewChild('validationEntity', {static: false}) validationEntity!: DxValidationGroupComponent; 
  @Input() entity : any = {};  
  @Input() listData: any[]=[];
  @Input() state = 'detail';
  existName = false;

  constructor(
    private groupService: GroupService
  ) { 
    this.validationAsync = this.validationAsync.bind(this);
  }

  ngOnInit(): void {
    
  }
  async validationAsync(){
    // const body = {
    //   ID: this.entity.ID ? this.entity.ID : 0,
    //   cRoleName: this.entity.
    // }
    // if(this.state != 'detail'){
    //   const value$ = this.roleService.checkName(body)
    //   let value!: any;
    //   value = await lastValueFrom(value$);
    //   if(value.Data==1){
    //     this.existName = false;
    //   } else {
    //     this.existName = true;
    //   }
    //   return value.Data==1;
    // } else {
    //   this.existName = false;
    //   return true;
    // }
  }

}
