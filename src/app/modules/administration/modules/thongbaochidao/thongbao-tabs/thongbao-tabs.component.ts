import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { NotificationService, SystemConstants } from "src/app/shared";
import { dxButtonConfig } from "src/app/shared/config";

@Component({
    selector: 'app-thongbaochidao-tabs',
    templateUrl: './thongbao-tabs.component.html'
})
export class ThongBaoChiDao_ThongBaoTabsComponent implements OnInit {
    idFeature: any = 'thongbaonhan';
    redirectUrl: any;
    dxButtonConfig = dxButtonConfig;
    isOpenCreateForm = false;
    isReloadBaoCaoDaGui = false;
    user : any = {};
    isUserCucDoanhTrai = false;
    constructor(
        private notificationService: NotificationService
    ) { }
    ngOnInit() {
        // redirect to redirectUrl (query params)

        // subscribe to reload when idCoSo and idFeature change
        this.user = JSON.parse(localStorage.getItem(SystemConstants.CURRENT_USER) as string);
        if (this.user && (this.user.MaDonVi == null || this.user.MaDonVi.length <= 2)) {
            this.isUserCucDoanhTrai = true;
            this.idFeature = 'thongbaodagui';
        } else {
            this.isUserCucDoanhTrai = false;
        }
    }


    handleChangeTabs (tabName) {
        this.idFeature = tabName;
    }

    openCreateForm () {
        this.isOpenCreateForm = true;
    }

    getNotifyParentValue (event) {
        if (event.action === 'ADD') {
            if (event.success) {
                this.notificationService.showSuccess('Lưu thông tin thành công')
            }
            this.isReloadBaoCaoDaGui = true;
            this.isOpenCreateForm = false;
        }
    }

    getNotifyParentValueFromDaGui (event) {
        this.isReloadBaoCaoDaGui = event.isReloadBaoCaoDaGui;
    }
}
