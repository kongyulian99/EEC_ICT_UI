import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ThongBaoChiDao_ThongBaoTabsComponent } from './thongbao-tabs/thongbao-tabs.component';

const routes: Routes = [
    {
        path: 'thongbao',
        component: ThongBaoChiDao_ThongBaoTabsComponent
    },
    
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ThongBaoChiDaoRoutingModule { }
