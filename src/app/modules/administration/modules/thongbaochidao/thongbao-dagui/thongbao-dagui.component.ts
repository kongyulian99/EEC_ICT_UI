import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from "@angular/core";
import { NotificationService, SystemConstants } from "src/app/shared";
import { dxButtonConfig } from "src/app/shared/config";
import { DuLieuThongBaoChiDaoService } from "src/app/shared/services/dulieu-thongbaochidao.service";

@Component({
    selector: 'app-thongbaochidao-thongbaodagui',
    templateUrl: './thongbao-dagui.component.html'
})
export class ThongBaoChiDao_ThongBaoDaGuiComponent implements OnInit {
    user: any = {};
    pageIndex = 1;
    pageSize = 10;
    totalRecords = 0;

    items = [];

    maDonViNhan = '';
    keyword = '';

    PaginatorConfig = [5, 10, 25, 50, 100];
    prefixLinkDinhKem = '/Uploads/Documents/thongbaochidao';
    @Input() isReloadBaoCaoDaGui = false;
    @Output() notifyParent = new EventEmitter();
    dxButtonConfig = dxButtonConfig;

    constructor (
        private dulieuThongTinChiDaoService: DuLieuThongBaoChiDaoService,
        private notificationService: NotificationService
    ) {}

    ngOnInit(): void {
        this.user = JSON.parse(localStorage.getItem(SystemConstants.CURRENT_USER))
        this.loadAllThongBao(true);
    }

    ngOnChanges (changes: SimpleChanges) {
        if (changes['isReloadBaoCaoDaGui'] && this.isReloadBaoCaoDaGui) {
            this.loadAllThongBao(false);
            
        }
    }

    loadAllThongBao (init = false) {
        this.dulieuThongTinChiDaoService.selectByDonViGui(this.pageIndex, this.pageSize, this.user.MaDonVi || '', this.maDonViNhan, this.keyword)
            .subscribe(
                (res: any) => {
                    if (res.Status.Code === 1) {
                        this.items = res.Data;                       
                       
                        this.totalRecords = res.Pagination.TotalRows;
                        if (!init) {
                            this.notifyParent.emit({ isReloadBaoCaoDaGui: false })
                        }                        
                    }
                }
            )
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

    handleDeleteEntity(id: any) {
        this.notificationService.showConfirmation('Chắc chắn xóa bản ghi này?', () => {
            this.dulieuThongTinChiDaoService.delete(id)
                .subscribe({
                    next: (res: any) => {
                        if (res.Status.Code === 1) {
                            this.notificationService.showSuccess('Xóa thành công 1 bản ghi');
                            this.items = this.items.filter((x: any) => x.Id != id);
                        }
                    }
                })
        })
    }
}