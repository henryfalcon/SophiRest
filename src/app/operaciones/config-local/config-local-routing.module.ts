import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConfigLocalComponent } from './config-local.component';
import { MesaMeseroComponent } from './mesa-mesero/mesa-mesero.component';

const routes: Routes = [{ path: '', component: ConfigLocalComponent, children:[
  {path:'mesa-mesero', component: MesaMeseroComponent}
]}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConfigLocalRoutingModule { }
