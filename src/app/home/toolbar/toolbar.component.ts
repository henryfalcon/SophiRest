import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
//rxjs
import { take } from 'rxjs/operators';
//service
import { SidenavOperService } from '../sidenav/sidenav-oper.service';
import { AutenticacionService } from '../../autenticacion/autenticacion.service';
import { global_Info_System_Service } from '../../shared/utils/global_info.service';
//confirmation
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { OptionsMessageI } from '../../shared/confirm-dialog/options-message-i';
import { SnackNotisService } from '../../shared/snackBarNotifications/snack-notis.service';
//router
import { Router } from '@angular/router';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})

export class ToolbarComponent implements OnInit, AfterViewInit, OnDestroy {
  isLogged: boolean = false;
  Company_Name: string = "";
  options_msg: OptionsMessageI = {title:"Pregunta", message:"", confirmText:"Si", cancelText:"No"};

  constructor(private sideNavSvs: SidenavOperService,
              private authSvc: AutenticacionService,
              private global_info: global_Info_System_Service,
              public dialog: MatDialog,
              private snackInfo: SnackNotisService,
              private router: Router   ) { }


  ngOnInit(): void {
  }

   ngAfterViewInit(): void {
     this.authSvc.userLogged.subscribe(logged=>{
       this.isLogged=logged;       
       this.sideNavSvs.setSideNavMenu(logged); 
       if (logged) {
          this.Company_Name = this.global_info.get_user_info_service.company_name;}
     })
   }

  ngOnDestroy() {
    //this.authSvc.userLogged.unsubscribe();
  }

  confirm_logoutApplication(): void {
       this.options_msg.message = "¿Desea salir de la aplicación?";
       this.dialog.open(ConfirmDialogComponent, {data: this.options_msg})
         .afterClosed().pipe(take(1)).subscribe(res=> {
             if (res) {
              this.authSvc.logout();          
              this.snackInfo.succes("¡Hasta pronto!")
              this.router.navigate(['login']);
             }
       });    
  }

  showHideSideNavMenu(){
    this.sideNavSvs.setSideNavMenu(!this.sideNavSvs.getSideNavState());
   }
}
