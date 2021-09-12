import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ComandasComponent } from './comandas.component';
import { DespacharComandaComponent } from './despachar-comanda/despachar-comanda.component';
import { NuevaComandaComponent } from './nueva-comanda/nueva-comanda.component';
import { CancelarComandaComponent } from './cancelar-comanda/cancelar-comanda.component'

const routes: Routes = [ 
  {path: '', component: ComandasComponent, children:[
    {path: '', component: NuevaComandaComponent},
    {path: 'nueva_comanda',component: NuevaComandaComponent },
    {path: 'despachar',component: DespacharComandaComponent },
    {path: 'cancelar_comanda',component: CancelarComandaComponent }
  ]}]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ComandasRoutingModule { }
