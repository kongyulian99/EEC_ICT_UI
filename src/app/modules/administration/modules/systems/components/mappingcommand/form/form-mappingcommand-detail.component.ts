import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { DxValidationGroupComponent } from 'devextreme-angular';
import { PermissionService, RoleService } from 'src/app/shared';
import { MappingCommandService } from 'src/app/shared/services/mappingcommand.service';

@Component({
  selector: 'app-form-mappingcommand-detail',
  templateUrl: './form-mappingcommand-detail.component.html',
  styleUrls: ['./form-mappingcommand-detail.component.scss']
})
export class FormMappingCommandDetailComponent implements OnInit {

  @ViewChild('validationEntity', {static: false}) validationEntity!: DxValidationGroupComponent; 
  @Input() entity : any = {};  
  @Input() listData: any[]=[];
  @Input() state = 'detail';
  existName = false;

  allPermission = [];
  allRole = [];
  constructor(
    private permissionService: PermissionService,
    private roleService: RoleService
  ) { 
    this.validationAsync = this.validationAsync.bind(this);
  }

  ngOnInit(): void {
    this.loadDanhMuc();
  }


  loadDanhMuc () {
    this.permissionService.processCommand('PERMISSION_LIST', {})
      .subscribe(
        (res: any) => {
          if (res.ReturnStatus.Code === 0) {
            this.allPermission = res.ReturnData;
          }
        }
      )

      this.roleService.processCommand('ROLE_LIST', {})
      .subscribe(
        (res: any) => {
          if (res.ReturnStatus.Code === 1) {
            this.allRole = res.ReturnData;
          }
        }
      )
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
