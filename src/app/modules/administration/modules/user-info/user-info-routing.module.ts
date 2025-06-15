
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserInfoComponent } from './user-info.component';
import { EmptyPageComponent } from './empty-page/empty-page.component';

const routes: Routes = [
    {
        path: '',
        component: UserInfoComponent
    },
    {
        path: 'empty-page',
        component: EmptyPageComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class UserInfoRoutingModule {}
