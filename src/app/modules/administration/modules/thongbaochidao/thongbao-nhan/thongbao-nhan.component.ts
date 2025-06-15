import { Component, OnInit } from "@angular/core";
import { SystemConstants } from "src/app/shared";
import { dxButtonConfig } from "src/app/shared/config";
import { DuLieuThongBaoChiDaoDonViNhanService } from "src/app/shared/services/dulieu-thongbaochidao-donvinhan.service";
import { DuLieuThongBaoChiDaoService } from "src/app/shared/services/dulieu-thongbaochidao.service";
import { SignalrService } from "src/app/shared/services/signalr.services";

@Component({
    selector: 'app-thongbaochidao-thongbaonhan',
    templateUrl: './thongbao-nhan.component.html'
})
export class ThongBaoChiDao_ThongBaoNhanComponent implements OnInit {
    user: any = {};
    pageIndex = 1;
    pageSize = 10;
    totalRecords = 0;

    items = [];

    listFilterDonViGui = [];
    keyword = '';

    isOpenThongBaoView = false;
    selectedIdThongBao = 0;

    PaginatorConfig = [5, 10, 25, 50, 100];
    prefixLinkDinhKem = '/Uploads/Documents/thongbaochidao';
    dxButtonConfig = dxButtonConfig;
    constructor(
        private dulieuThongTinChiDaoService: DuLieuThongBaoChiDaoService,
        private dulieuThongTinChiDaoDonViNhanService: DuLieuThongBaoChiDaoDonViNhanService,
        private signalrService: SignalrService
    ) { }

    ngOnInit(): void {
        this.user = JSON.parse(localStorage.getItem(SystemConstants.CURRENT_USER))
        this.loadAllThongBao();
        this.signalrService.announcementThongBaoChiDao.subscribe((thongbao) => {
            this.loadAllThongBao();
        })
    }

    loadAllThongBao() {
        this.dulieuThongTinChiDaoService.selectByDonViNhan(this.pageIndex, this.pageSize, this.user.MaDonVi || '', this.listFilterDonViGui.join(','), this.keyword)
            .subscribe(
                (res: any) => {
                    if (res.Status.Code === 1) {
                        this.items = res.Data;

                        this.totalRecords = res.Pagination.TotalRows;
                    }
                }
            )
    }

    handleChangeListDonViGui () {
        console.log(this.listFilterDonViGui);
    }

    handlePageChange(event: any) {
        // redirect to this page with query params
        this.pageIndex = event.page;
        this.loadAllThongBao();

    }

    handlePageSizeChange(event: any) {
        // redirect to this page with query params
        this.loadAllThongBao();
    }

    openThongBaoView (id) {
        
        this.selectedIdThongBao = id;
        this.isOpenThongBaoView = true;

        let index = this.items.findIndex(el => el.Id == id);
      
        if (!this.items[index].DaNhan) {
            this.dulieuThongTinChiDaoDonViNhanService.updateDaNhan(id, this.user.MaDonVi || '', true)
                .subscribe(
                    (res: any) => {
                        if (res.Status.Code === 1) {
                            this.items[index].DaNhan = true;
                        }
                    }
                )
        }
        
    } 
}