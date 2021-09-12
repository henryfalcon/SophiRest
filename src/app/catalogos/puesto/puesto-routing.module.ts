import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PuestoComponent } from './puesto.component';
import { PuestoAddComponent } from './puesto-add/puesto-add.component';
import { PuestoListComponent } from './puesto-list/puesto-list.component';
import { PuestoEditComponent } from './puesto-edit/puesto-edit.component';

const routes: Routes = [{ path: '', component: PuestoComponent, children:[
  {path:'puesto-list', component: PuestoListComponent},
  {path:'puesto-add', component: PuestoAddComponent},
  {path:'puesto-edit', component: PuestoEditComponent}
]}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PuestoRoutingModule { }
