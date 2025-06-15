import { clone } from 'src/app/shared';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { dxButtonConfig } from '../../config';

@Component({
  selector: 'app-multi-images',
  templateUrl: './multi-images.component.html',
  styleUrls: ['./multi-images.component.scss']
})
export class MultiImagesComponent implements OnInit {

    dxButtonConfig = dxButtonConfig;
    @Input() listFile: any[]=[];
    fileDetail: any = null;
    itemsFormFooter = [];
    // form values
    ghiChu = '';
    // @Input() UrlImage?: any;
    // @Input() base64Data?: any;
    // notify parent component
    @Output() valueChanged = new EventEmitter();
    // private _popupVisible: boolean = false;
    // set popupVisible(value:boolean){
    //     this._popupVisible = value;
    // }
    // get popupVisible(){
    //     return this._popupVisible;
    // }
    // saveButtonOptions!: any;
    // deleteButtonOptions!: any;
    constructor() { 
        // this.readURL = this.readURL
    // const that = this;
    // this.saveButtonOptions = {
    //   icon: 'fa fa-check',
    //   text: 'Thêm',
    //   type: 'default',
    //   onClick(e:any) {
    //     that.popupVisible = false;
    //     that.fileDetail;
    //   },
    // };
    // this.deleteButtonOptions = {
    //   icon: 'fa fa-times',
    //   text: 'Xóa',
    //   type: 'danger',
    //   onClick(e:any) {
    //     console.log(that.fileDetail);
    //     that.popupVisible = false;
        
    //   },
    // };
    }
    ngOnInit() {
    }

    readURL(event: any): void {
        // console.log(event.target.files);
        if (event.target.files) {
            const listFile: any[] = [];
            for(let i=0; i<event.target.files.length; i++){
                const file = event.target.files[i];
                listFile.push({File: file});

                const reader = new FileReader();
                reader.onload = e => {
                    listFile[i].fileBase64 = reader.result;
                    listFile[i].NoiDung = '';
                }
                reader.readAsDataURL(file);
            }
            // console.log(this.listFile)
            // this.listFile.push(...listFile);
            this.valueChanged.emit({
                data: {
                    value: listFile,
                },
                status: 'add'
            });
        }
        // console.log('isbase');
    }
    deleteImgDetail(index: number) {
        // this.listFile.splice(index,1);
        this.valueChanged.emit({
            data: {
                value: index,
            },
            status: 'delete'
        });
    }
    textChanged(index: number){
        this.valueChanged.emit({
            data: {
                value: {text:this.listFile[index].NoiDung, index:index},
            },
            status: 'changetext'
        });
    }
    ngOnDestroy() { 
        this.valueChanged.unsubscribe();
    }
}
