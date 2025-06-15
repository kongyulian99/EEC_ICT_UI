import { Component, Input, OnInit,ViewChild } from '@angular/core';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import DataSource from 'devextreme/data/data_source';
import { DuLieuLichXeNguonNhienLieuService } from '../../services/dulieu_lichxe_nguonnhienlieu.service';
import { NotificationService } from '../../services';
import { ActivatedRoute, Router } from '@angular/router';
import { DxDataGridComponent } from 'devextreme-angular';
import { dxButtonConfig, PaginatorConfig } from 'src/app/shared/config';
@Component({
  selector: 'app-print',
  templateUrl: './print.component.html',
  styleUrls: ['./print.component.scss']
})
export class PrintComponent implements OnInit {
@Input() dataGrid: DxDataGridComponent;
@Input() pageIndex:number;
@Input() pageSize:number;
  dxButtonConfig = dxButtonConfig;
  ngOnInit(): void {}
  constructor(
    private DuLieuLichXeNguonNhienLieuService: DuLieuLichXeNguonNhienLieuService,
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute,

) { 
}

@Input() gridTitle: string = 'Nguồn nhiên liệu'; // Thêm tiêu đề cho bảng
@Input() dataSource: DataSource;// tham chiếu đến nguồn dữ liệu của dataGrid là nguồn lấy từ api 
  async printData() {
    const gridInstance = this.dataGrid.instance;
    const columns = gridInstance.getVisibleColumns().filter(column => 
        column.caption && column.caption.trim() !== ''
    );
    
    try {
        // Lấy tất cả dữ liệu từ DataSource
        await this.dataSource.load();
        const allItems = this.dataSource.items();

        let tableHtml = `
            <h2>${this.gridTitle}</h2>
            <table>
                <thead>
                    <tr>
                        ${columns.map(column => `<th>${column.caption || column.dataField}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
        `;

        allItems.forEach((item, rowIndex) => {
            tableHtml += '<tr>';
            columns.forEach((column, columnIndex) => {
                let cellValue = item[column.dataField];
                
                // Áp dụng định dạng từ DataGrid
                // if (typeof column.cellTemplate === 'function') {
                //     // Tạo một phần tử div tạm thời để chứa kết quả của cellTemplate
                //     const tempElement = document.createElement('div');
                //     column.cellTemplate(tempElement, {
                //         data: item,
                //         column: column,
                //         value: cellValue,
                //         rowIndex: rowIndex,
                //         columnIndex: columnIndex,
                //         displayValue: cellValue,
                //         text: String(cellValue),
                //         rowType: 'data',
                //         component: gridInstance
                //     } as any);
                //     cellValue = tempElement.innerText || tempElement.textContent;
                // } else if (column.dataType === 'date') {
                //     cellValue = cellValue ? new Date(cellValue).toLocaleDateString() : '';
                // } else if (column.dataType === 'boolean') {
                //     cellValue = cellValue ? 'Có' : 'Không';
                // } else if (typeof column.calculateCellValue === 'function') {
                //     cellValue = column.calculateCellValue(item);
                // }

                tableHtml += `<td>${cellValue !== undefined && cellValue !== null ? cellValue : ''}</td>`;
            });
            tableHtml += '</tr>';
        });

        tableHtml += '</tbody></table>';

        // Tạo và mở cửa sổ in mới
        const printWindow = window.open('', '', '');
        printWindow.document.open();
        printWindow.document.write(`
            <html>
                <head>
                    <title>.</title>
                    <style>
                        body { font-family: Arial, sans-serif; }
                        h2 { text-align: center; }
                        table { border-collapse: collapse; width: 100%; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f2f2f2; font-weight: bold; }
                        @media print {
                            body { -webkit-print-color-adjust: exact; }
                        }
                    </style>
                </head>
                <body>
                    ${tableHtml}
                    <script>
                 
                        window.onload = function() {
                            setTimeout(function() {
                                window.print();
                                window.close();
                            }, 250);
                        };
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    } catch (error) {
        console.error('Error loading data:', error);
        this.notificationService.showError('Không thể tải dữ liệu để in.');
    }
}
}
