import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home.component';
import { IsLoggedGuard } from '../guards/is-logged.guard';
import { IsLoggedActivate } from '../guards/is-logged-can-activate.guard';

const routes: Routes = [
  { path: '', component: HomeComponent, children:[  
    { path: 'login',     loadChildren: () => import('../autenticacion/login/login.module').then(m => m.LoginModule) },    
    { path: 'register',  loadChildren: () => import('../autenticacion/register/register.module').then(m => m.RegisterModule) },    
    { path: 'dashboard', loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule) },    
    { path: 'cocina', canLoad:[IsLoggedGuard], canActivate:[IsLoggedActivate], loadChildren: () => import('../operaciones/cocina/cocina.module').then(m=>m.CocinaModule)  },    
    { path: 'usuarios',  canLoad:[IsLoggedGuard], canActivate:[IsLoggedActivate], loadChildren: () => import('../catalogos/user/user.module').then(m => m.UserModule) },    
    { path: 'empleados', canLoad:[IsLoggedGuard], canActivate:[IsLoggedActivate], loadChildren: () => import('../catalogos/employee/employee.module').then(m=>m.EmployeeModule)},        
    { path: 'platillos', canLoad:[IsLoggedGuard], canActivate:[IsLoggedActivate], loadChildren: () => import('../catalogos/platillo/platillo.module').then(m => m.PlatilloModule)},
    { path: 'puestos',   canLoad:[IsLoggedGuard], canActivate:[IsLoggedActivate], loadChildren: () => import('../catalogos/puesto/puesto.module').then(m => m.PuestoModule)},
    { path: 'configLocal', canLoad:[IsLoggedGuard], canActivate:[IsLoggedActivate], loadChildren: () => import('../operaciones/config-local/config-local.module').then(m => m.ConfigLocalModule) },
    { path: 'comandas',    canLoad:[IsLoggedGuard], canActivate:[IsLoggedActivate], loadChildren: () => import('../operaciones/comandas/comandas.module').then(m => m.ComandasModule) },
  ]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
