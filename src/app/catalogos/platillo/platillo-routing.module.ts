import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PlatilloComponent } from './platillo.component';
import { PlatilloAddComponent } from './platillo-add/platillo-add.component';
import { PlatilloEditComponent } from './platillo-edit/platillo-edit.component';
import { PlatilloListComponent } from './platillo-list/platillo-list.component';

const routes: Routes = [{ path: '', component: PlatilloComponent, children:[
    {path:'platillo-list', component: PlatilloListComponent},
    {path:'platillo-add', component: PlatilloAddComponent},
    {path:'platillo-edit', component: PlatilloEditComponent}
]}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PlatilloRoutingModule { }
