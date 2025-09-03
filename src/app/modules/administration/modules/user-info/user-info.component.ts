import { Component, OnInit } from '@angular/core';
import { NotificationService, SystemConstants, UserService, fixTimezoneToJSON } from 'src/app/shared';
import { dxButtonConfig } from 'src/app/shared/config';

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.scss']
})
export class UserInfoComponent implements OnInit {
  user: any = {};
  title: string = 'User Information';


  allGender = [{ label: 'Male', value: 1}, { label: 'Female', value: 2}]
  entity : any = {}

  dxButtonConfig = dxButtonConfig;
  constructor(
    private usersService: UserService,
    private notificationService: NotificationService
    ) { }

  ngOnInit(): void {
    this.user = JSON.parse(localStorage.getItem(SystemConstants.CURRENT_USER));
    this.loadDetail();
  }


  loadDetail  () {
    this.usersService.processCommand('USER_GET_INFO', { UserName: this.user.UserName })
      .subscribe(
        (res: any) => {
          if (res.ReturnStatus.Code === 0) {
            this.entity = res.ReturnData;          
          }
        }
      )
  }

  onFormSubmit(event) {
    event.preventDefault();

    this.usersService.processCommand('USER_UPDATE', this.entity)
      .subscribe(
        (res: any) => {
          if (res.ReturnStatus.Code === 0) {
            this.notificationService.showSuccess('Information saved successfully');
          }
        }
      )


  }

}
