import { Component, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { DxValidationGroupComponent } from 'devextreme-angular';
import { clone, NotificationService, UserService, validationPasswordSpecialCharacter } from 'src/app/shared';
import { dxButtonConfig } from 'src/app/shared/config';
import { GroupService } from 'src/app/shared/services/group.service';

@Component({
  selector: 'app-form-user-detail',
  templateUrl: './form-user-detail.component.html',
  styleUrls: ['./form-user-detail.component.scss']
})
export class FormUserDetailComponent implements OnInit {

  @ViewChild('validationEntity', {static: false}) validationEntity!: DxValidationGroupComponent;
  @Input() entity : any = {};
  @Input() listData: any[]=[];
  @Input() state = 'detail';
  existName = false;
  popupVisible = false;

  allGroup: any = [];
  listGroupInUser : any = [];
  listGroupNotInUser : any = [];

  listGioiTinh = [{ label: 'Nam', value: 1}, { label: 'Nữ', value: 2}]
  dxButtonConfig = dxButtonConfig;
  constructor(
    private userService: UserService,
    private groupService: GroupService,
    private notificationService: NotificationService
  ) {
    this.validationExitingUser = this.validationExitingUser.bind(this);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['entity']) {
      this.entity = {
        ...this.entity,
        DonViQuanLyTrucTiep: this.entity.DonViQuanLyTrucTiep?.split(',')
      }
      if (this.state != 'insert' && this.entity.ID) {
        this.userService.processCommand('USER_GET_INFOGROUP', { ID: this.entity.ID })
          .subscribe(
            (res: any) => {
              if (res.ReturnStatus.Code === 0) {
                this.listGroupInUser = res.ReturnData;
                this.listGroupNotInUser = this.allGroup.filter(x => this.listGroupInUser.findIndex(el => el.fkGroupId == x.ID) < 0)
                                          .map(el => ({ ...el, fkGroupId: el.ID, check: false }))
              }
            }
          )
      }
    }
  }

  ngOnInit(): void {
    this.loadAllDanhMuc();
  }

  loadAllDanhMuc () {
    this.groupService.processCommand('GROUP_LIST', { Keyword: ""})
      .subscribe(
        (res: any) => {
          if (res.ReturnStatus.Code === 0) {
            this.allGroup = res.ReturnData;
          }
        }
      )
  }

  validationExitingUser(e){
    if (this.state == 'insert') {
      let index = this.listData.findIndex(x => x.cUserName == e.value);

      if (index > -1) return false;
      return true;
    } else if (this.state == 'edit') {
      let index = this.listData.findIndex(x => x.cUserName == e.value && x.ID != this.entity.ID);
      if (index > -1) return false;
      return true;
    } else {
      return true;
    }

  }

  testCustomValidation (e) {
    return false;
  }
  validationPasswordCheck(e){
    return validationPasswordSpecialCharacter(e.value);
  }


  openGroupForm () {
    this.popupVisible = true;
  }
  saveGroupForm() {
    let list = this.listGroupNotInUser.filter(el => el.check).map(el => ({ fkUserId: this.entity.ID, fkGroupId: el.fkGroupId, cGroupName: el.cGroupName }))

    this.userService.processCommand('USER_ADD_INFOGROUP', list)
      .subscribe(
        (res: any) => {
          if (res.ReturnStatus.Code === 0) {
            this.popupVisible = false;
            let listAddID = res.ReturnData;
            this.listGroupNotInUser = this.listGroupNotInUser.filter(x => listAddID.findIndex(el => x.fkGroupId == el.fkGroupId) < 0);
            this.listGroupInUser = [ ...this.listGroupInUser, ...listAddID];
          }
        }
      )
  }


  deleteGroup (groupId) {
    this.userService.processCommand('USER_DELETE_INFOGROUP', {  ID: groupId })
      .subscribe(
        (res: any) => {
          if (res.ReturnStatus.Code === 0) {
            this.notificationService.showSuccess('Xoá thông tin thành công');

            let index = this.listGroupInUser.findIndex(x => x.ID == groupId);
            let obj = clone(this.listGroupInUser[index]);

            this.listGroupInUser = this.listGroupInUser.filter(x => x.ID !== groupId);
            this.listGroupNotInUser = [...this.listGroupNotInUser, obj]
          }
        }
      )
  }
}
