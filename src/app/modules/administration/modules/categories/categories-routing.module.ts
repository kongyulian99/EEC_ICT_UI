import { NgModule } from '@angular/core';
  import { RouterModule, Routes } from '@angular/router';
import { TopicsComponent } from './topics/topics.component';

const routes: Routes = [
  {
    path: 'topics',
    component: TopicsComponent
  }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CategoriesRoutingModule { }
