import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { FileService, SystemConstants, fixTimezoneToJSON } from "src/app/shared";
import { dxButtonConfig } from "src/app/shared/config";
import { DuLieuThongBaoChiDaoService } from "src/app/shared/services/dulieu-thongbaochidao.service";

@Component({
    selector: 'app-form-thongbaochidao-view',
    templateUrl: './form-thongbaochidao-view.component.html'
})
export class FormThongBaoChiDaoViewComponent implements OnInit {
    loading = false;
    @Input() IdThongBao = 0;

    uploadFile = null;

    detailThongBao : any = {}

    user: any = {}


    prefixLinkDinhKem = '/Uploads/Documents/thongbaochidao';
    dxButtonConfig = dxButtonConfig;

    @Output() notifyParent = new EventEmitter();

    constructor (
        private fileService: FileService,
        private dulieuThongBaoChiDaoService: DuLieuThongBaoChiDaoService
    ) {}
    ngOnInit(): void {
        this.user = JSON.parse(localStorage.getItem(SystemConstants.CURRENT_USER));
        
        if (this.IdThongBao && this.IdThongBao > 0) {
            this.dulieuThongBaoChiDaoService.selectOne(this.IdThongBao)
                .subscribe(
                    (res: any) => {
                        if (res.Status.Code === 1) {
                            this.detailThongBao = res.Data;                           
                        }
                        
                    }
                )

            
        } 
    }
 
}