import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CocinaComponent } from './cocina-component/cocina.component'
import { CocinaComandaComponent } from './cocina-comanda/cocina-comanda.component';


const routes: Routes = [{ path: '', component: CocinaComponent, children: [
  { path: 'comanda-detalle', component: CocinaComandaComponent}
] }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CocinaRoutingModule { }
