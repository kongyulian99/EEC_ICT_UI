import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';

@Component({
    selector: 'app-paginator',
    templateUrl: './paginator.component.html',
    styleUrls: ['./paginator.component.scss'],
})
export class PaginatorComponent implements OnInit {
  @Input() showLeftPanel = true;
    @ViewChild('paginator', { static: false })
    paginator!: NgbPagination;
    private _page: number = 1;
    @Input()
    set page (value: number) {
        this.pageChange.emit(value);
        this._page = value;
    }
    get page () {
        return this._page;
    }
    @Output('pageChange') pageChange = new EventEmitter<number>();  // output
    private _pageSize!: number;
    @Input()
    set pageSize (value: number) {
        this.pageSizeChange.emit(value);
        this._pageSize = value;
    }
    get pageSize () {
        return this._pageSize;
    }
    @Output('pageSizeChange') pageSizeChange = new EventEmitter<number>();  // output
    private _totalRows!: number;
    @Input()
    set totalRows (value: number) {
        this._totalRows = value;
        if(this.paginator){
            this.paginator.page = this.page;
        }
    }
    get totalRows () {
        return this._totalRows;
    }
    @Input() pageSizes: any[]=[];
    @Output() onPageChanged = new EventEmitter<any>();
    @Output() onPageSizeChanged = new EventEmitter<any>();
    @Input() nameData: string= 'bản ghi';
    constructor() { }

    ngOnInit(): void {
    }
    pageChanged(e: any) {
        if(this.totalRows>0){
            this.page = e;
            this.paginator.page = this.page;
            this.onPageChanged.emit({
                action: 'pagechange',
                page: e
            });
        }
    }
    pageSizeChanged() {
        this.onPageSizeChanged.emit({
            action: 'pageSizeChange',
            pageSize: this.pageSize,
        });
    }

}

