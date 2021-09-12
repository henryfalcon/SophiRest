import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { global_Info_System_Service } from '../../../shared/utils/global_info.service';
import { AutenticacionService } from '../../../autenticacion/autenticacion.service';
import { MenuItem } from './menu-item';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})

export class MenuComponent implements OnInit {
  user_email = "";
  display_name = "";
  user_role = "";
  fotografia = "";
  
  isExpanded = true;
  isShowing = false;
  profileMenuHeight: number = 0;
  catalogoMenuHeight: number = 0;
  operacionMenuHeight: number = 0;
  reporteMenuHeight: number = 0;
  
  showProfile: boolean = false;
  showSubmenu: boolean = true;
  showMenuCatalogos: boolean = false;
  showMenuOperaciones: boolean = false
  showMenuReportes: boolean = false;
  
  catalogoItems: MenuItem[] = [
    {nombre: 'Empleados', ruta:'empleados', icono:'perm_contact_calendar'},
    {nombre: 'Platillos', ruta:'platillos', icono:'food_bank'},
    {nombre: 'Usuarios',  ruta:'usuarios', icono:'supervised_user_circle'},
    {nombre: 'Puestos',   ruta:'puestos', icono:'hail'}
  ];  

  operacionesItems: MenuItem[] = [
    {nombre: 'Configurar Local', ruta: 'configLocal', icono: 'store'},
    {nombre: 'Comandas', ruta: 'comandas', icono: 'restaurant' },
    {nombre: 'Cocina', ruta: 'cocina', icono: 'kitchen'},
    {nombre: 'Caja', ruta: 'caja', icono: 'money'}
  ]

  reportesItems: MenuItem[] = [
    {nombre: 'Ventas', ruta: 'reportes', icono: 'stacked_bar_chart'},
    {nombre: 'Pedidos', ruta: 'reportes', icono: 'sports_motorsports'},
    {nombre: 'Corte de Caja', ruta: 'reportes', icono: 'point_of_sale'}
  ]

  constructor( private router: Router, 
               private global_info: global_Info_System_Service,
               private authSvc: AutenticacionService
               ) { }

  ngOnInit(): void {
    //
  }

  ngOnDestroy(): void {
    //this.authSvc.userLogged.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.authSvc.userLogged.subscribe(logged=>{
      if (logged) {
        if (this.global_info != undefined){
          this.user_email = this.global_info.get_user_info_service.user_email;
          this.display_name = this.global_info.get_user_info_service.displayName;
          this.user_role = this.global_info.get_user_info_service.role;
          this.fotografia = this.global_info.get_user_info_service.photoURL;      
        }      
      }
    });   
  }
  
  mouseenter() {
    if (!this.isExpanded) {
      this.isShowing = true;
    }
  }

  mouseleave() {
    if (!this.isExpanded) {
      this.isShowing = false;
    }
  }

  setMenuHeight(menu:string){
    switch (menu) {
      case "profile":
        this.showProfile = !this.showProfile;
        this.profileMenuHeight = this.showProfile? 200: 0;              
        break;
      case "catalogo":
        this.showMenuCatalogos = !this.showMenuCatalogos;
        this.catalogoMenuHeight = this.showMenuCatalogos? 40: 0;
        break;
      case "operacion":
        this.showMenuOperaciones = !this.showMenuOperaciones;
        this.operacionMenuHeight = this.showMenuOperaciones? 40: 0;
        break;     
        case "reporte":
          this.showMenuReportes = !this.showMenuReportes;
          this.reporteMenuHeight = this.showMenuReportes? 40: 0;
          break;             
      default:
        break;
    }
  }

  gotoDashboard(){
    this.router.navigate(['/Dashboard']);
  }
}