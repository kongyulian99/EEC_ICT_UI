import { Directive, ElementRef, Input, OnInit } from '@angular/core';
import { SystemConstants } from '../constants/systems.constant';
// import * as jwt_decode from 'jwt-decode';
import jwt_decode from 'jwt-decode';

@Directive({
    selector: '[appPermission]'
})
export class PermissionDirective implements OnInit {
    @Input() appRole: string;
    @Input() permissionCode: string;

    constructor(private el: ElementRef) {

    }
    ngOnInit() {
        const user = JSON.parse(localStorage.getItem(SystemConstants.CURRENT_USER));
        const roles = user.Roles;

        let check = false;
        for (let i = 0; i < roles?.length; i++) {
            let role = roles[i];
            if (role.cRoleCode == this.appRole
                && role.permissions.findIndex((per: any) => per.cPermissionCode === this.permissionCode) > -1
            ) {
                check =  true;
            }
        }

        if (check) {
            // this.el.nativeElement.style.display = '';
            this.el.nativeElement.classList.add('havePermission');
        } else {
            this.el.nativeElement.style.display = 'none';
            this.el.nativeElement.classList.add('noPermission');
        }

        // if (roles.indexOf('root') === -1) {
        //     const permissions = user.permissions;
        //     if (permissions && permissions.indexOf(this.appRole + '_' + this.appCommand) !== -1) {
        //         this.el.nativeElement.style.display = '';
        //     } else {
        //         this.el.nativeElement.style.display = 'none';
        //     }
        // } else {
        //     this.el.nativeElement.style.display = '';
        // }
    }
}
