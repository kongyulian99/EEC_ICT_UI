import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { FileService, SystemConstants, fixTimezoneToJSON } from "src/app/shared";
import { dxButtonConfig } from "src/app/shared/config";
import { DuLieuThongBaoChiDaoService } from "src/app/shared/services/dulieu-thongbaochidao.service";

@Component({
    selector: 'app-form-thongbaochidao',
    templateUrl: './form-thongbaochidao.component.html'
})
export class FormThongBaoChiDaoComponent implements OnInit {
    loading = false;
    @Input() IdThongBao = 0;

    uploadFile = null;

    detailThongBao : any = {
        Ten: '',
        NoiDung: '',
        NgayThongBao: new Date(),
        HanXuLy: new Date(),
        ListMaDonViNhan: [],
        TaiLieuDinhKem: ''
    }

    user: any = {}
    isEditCase = false;


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
                            const { Ten, NoiDung, NgayThongBao, HanXuLy, TaiLieuDinhKem } = res.Data;
                            this.detailThongBao.Ten = Ten;
                            this.detailThongBao.NoiDung = NoiDung;
                            this.detailThongBao.NgayThongBao = NgayThongBao;
                            this.detailThongBao.HanXuLy = HanXuLy;
                            this.detailThongBao.ListMaDonViNhan =
                                this.detailThongBao.TaiLieuDinhKem = TaiLieuDinhKem;
                            this.isEditCase = true;
                        }
                        
                    }
                )
        } else {
            this.isEditCase = false;
        }

    }


    onFileChange(event) {
        this.loading = true;
        this.uploadFile = event.target.files[0];
        const chunkSize = 1024 * 1024;
        const totalChunks = Math.ceil(this.uploadFile.size / chunkSize);
        const fileId = this.uploadFile.name;

        const chunks = [];
        for (let i = 0; i < totalChunks; i++) {
            const start = i * chunkSize;
            const end = Math.min(start + chunkSize, this.uploadFile.size);
            const chunk = this.uploadFile.slice(start, end);
            chunks.push(chunk);
        }
        chunks.forEach((chunk, index) => {
            const formData = new FormData();
            formData.append('fileId', fileId);
            formData.append('chunkNumber', index.toString());
            formData.append('totalChunks', totalChunks.toString())
            formData.append('chunk', chunk)

            this.fileService.uploadChunk(formData, 'thongbaochidao')
                .subscribe(
                    (res: any) => {
                        if (index == totalChunks - 1 && res.Status.Code == 1) {
                            this.detailThongBao.TaiLieuDinhKem = res.Data;
                            this.loading = false;
                        }
                    }
                )
        })

    }

    save (event) {
        event.preventDefault();

        if (this.isEditCase) {

        } else {
            this.dulieuThongBaoChiDaoService.insert({
                ...this.detailThongBao,
                NgayThongBao: fixTimezoneToJSON(this.detailThongBao.NgayThongBao),
                HanXuLy: fixTimezoneToJSON(this.detailThongBao.HanXuLy),
                MaDonViGui: this.user.MaDonVi,
                NgayTao: fixTimezoneToJSON(new Date()),
                NguoiTao: this.user.Id,
                ListDonViNhan: this.detailThongBao.ListMaDonViNhan.map(el => ({
                    MaDonViNhan: el,
                    DaNhan: false
                }))
            })
                .subscribe(
                    (res: any) => {
                        if (res.Status.Code === 1) {
                            this.notifyParent.emit({
                                action: 'ADD',
                                newIdEntity: res.Data,
                                success: true
                            })
                        }
                    }
                )
        }
    } 
}