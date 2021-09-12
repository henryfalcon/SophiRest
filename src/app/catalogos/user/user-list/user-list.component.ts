import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
//material
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
//database service
import { DbUserOperationsService } from '../dbOperations/db-user-operations.service';
import { global_Info_System_Service } from '../../../shared/utils/global_info.service';
//utils services
import { IsLoadingService } from '@service-work/is-loading';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { ModalComponent } from '../modal/modal.component';
import { SnackNotisService } from '../../../shared/snackBarNotifications/snack-notis.service';
//interfaces
import { OptionsMessageI } from '../../../shared/confirm-dialog/options-message-i';
import { UserI } from '../../../shared/interface/user-i';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  user_role:string="";
  searchKey:string="";
  filterColumn:string="";
  dataSource=new MatTableDataSource();  
  displayedColumns: string[] = ['email', 'emailVerified', 'displayName', 'employeeID', 'role', 'actions'];
  options_msg: OptionsMessageI = {title:"Pregunta", message:"", confirmText:"Si", cancelText:"No", isErrorMsg:false};

  @ViewChild(MatPaginator, {static:true}) paginator:MatPaginator;
  @ViewChild(MatSort, {static:true}) sort:MatSort;

  constructor ( private loadSvc: IsLoadingService,
                private user_info: global_Info_System_Service,
                private dialog: MatDialog,
                private db_user: DbUserOperationsService,
                private snackInfo: SnackNotisService ){} 
                
  onSearchClear(){
    this.searchKey = "";
    this.applyFilter();
  }

  applyFilter(){
    this.dataSource.filter = this.searchKey.trim().toLocaleLowerCase();    
  }

  ngOnInit(): void {
    const load_employees = this.db_user.getUsers();
    this.loadSvc.add(load_employees, {key: "loading"});
    load_employees.subscribe(users => {this.dataSource.data = users;});
    if (this.user_info.get_user_info_service != undefined){
      this.user_role = this.user_info.get_user_info_service.role
    }
  }

  isDataLoading(key_loading: string): boolean {
    return this.loadSvc.isLoading({key: key_loading});
  }

  confirm_Delete_User_Employee(user: UserI): void {
    if (user.employeeID !== ""){
      this.options_msg.message="Se eliminará la relacion empleado-usuario, ¿Desea continuar?";
      this.dialog.open(ConfirmDialogComponent, {data: this.options_msg})
        .afterClosed().subscribe(res=>{
            if (res) { this.Delete_User_Employee_Relation(user); }
        });      
    }
    else {
      this.options_msg.message="¿Desea eliminar el usuario con email: " + user.email;
      this.dialog.open(ConfirmDialogComponent, {data: this.options_msg})
        .afterClosed().subscribe(res=> {
          if (res) { this.delete_User(user.uid)}
        })
    }
  }

  delete_User(userid: string) {
    this.db_user.delete_User(userid).then(()=> 
      this.snackInfo.succes("Usuario Eliminado"))
      .catch(error=> this.showErrorMessage("Error al eliminar el usuario" + error));
  }

  Delete_User_Employee_Relation(user: UserI): void {
    if (user.employeeID !== ""){
      const deleting = this.db_user.delete_User_Employee(user);
      this.loadSvc.add(deleting, {key:"loading"});
      deleting.then(() => {this.snackInfo.succes("¡Relación Empleado-Usuario Eliminado!")})
              .catch( error =>
                  this.showErrorMessage ("Batch Error en Employee ó User Collection: " + error));
    }
  } 

  showErrorMessage(message: string): void{
    this.options_msg.title = "Ha ocurrido el siguiente Error:";
    this.options_msg.confirmText ="Ok";
    this.options_msg.isErrorMsg=true;
    this.options_msg.message = message;
    const dialogconfirm = this.dialog.open(ConfirmDialogComponent, {
      data: this.options_msg
    });
    dialogconfirm.afterClosed().subscribe(res=>this.setDefaultConfirmDialogConfig());
  }

  setDefaultConfirmDialogConfig(): void{
    this.options_msg.title = "Pregunta";
    this.options_msg.confirmText ="Yes";
    this.options_msg.isErrorMsg=false;
  }

  onEditUser(user: UserI): void {
    this.openDialog(user);
  }

  openDialog(user: UserI):void{
    const config = { data: {
        toForm: 'edit_User',
        message: 'Editar Usuario',
        content: user 
    }};
    const dialogRef = this.dialog.open(ModalComponent, config);
    dialogRef.afterClosed().subscribe(result=>{
      console.log("close");
    });
  }
}
