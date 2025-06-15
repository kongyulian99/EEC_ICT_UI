import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SystemConstants } from 'src/app/shared';
import { AuthGuard } from 'src/app/shared/guard';

const routes: Routes = [
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class BieudoRoutingModule {}
