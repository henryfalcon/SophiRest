import { Component, OnInit, Input, ViewChild, AfterViewInit, OnDestroy  } from '@angular/core';
//Reactive Forms
import { FormGroup, FormControl, FormGroupDirective, Validators, NgForm } from "@angular/forms";
//rxjs
import { BehaviorSubject } from 'rxjs';
//Services
import { DbUserOperationsService } from '../dbOperations/db-user-operations.service';
// interfaces
import { UserI } from '../../../shared/interface/user-i';
import { EmployeeI } from '../../employee/dbOperations/employee-i';
import { OptionsMessageI } from '../../../shared/confirm-dialog/options-message-i';
import { user_Roles } from '../../../shared/interface/roles-i';
//utils services
import { IsLoadingService } from '@service-work/is-loading';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { SnackNotisService } from '../../../shared/snackBarNotifications/snack-notis.service';
//Material
import { MatDialog } from '@angular/material/dialog';
import { MatSelect } from '@angular/material/select';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.css']
})

export class UserEditComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() user: UserI; 
  @ViewChild('matSelectUser') matSelectUser: MatSelect;
  @ViewChild('matSelectRol') matSelectRol: MatSelect;
  emp: EmployeeI;
  emps: EmployeeI[];
  options_msg: OptionsMessageI = {title:"Pregunta", message:"", confirmText:"Si", cancelText:"No"};  
  user_updated: UserI;
  userRoles: user_Roles[]=[{id_rol:'rol1', role:'ADMIN'}, {id_rol:'rol2', role:'GUEST'}, {id_rol:'rol3', role:'EDITOR'}];
  selected_empID: string="";
  selected_user_role: string="";
  valid_user_selection = new BehaviorSubject(false);
  valid_user_select: boolean = false;

  constructor(  private user_db_Oper: DbUserOperationsService,
                private loadSvc: IsLoadingService, 
                private dialog: MatDialog,
                private snackInfo: SnackNotisService ) { }
  
  public editUserForm = new FormGroup({
    id: new FormControl(''), 
    
  });

  private initValuesForm(): void {
    this.editUserForm.patchValue({
      uid: this.user.uid,
    })        
  }          
  
  private LoadEmployeesWithoutUser(){
      const loading = this.user_db_Oper.getEmployeesWithoutUser();
      this.loadSvc.add(loading, {key:"loading"});
      loading.subscribe(emps => {this.emps = emps});
  }
  
  ngOnInit(): void {
    setTimeout(()=>{this.LoadEmployeesWithoutUser();});
    this.initValuesForm();
  }

  ngAfterViewInit(): void {
    if (this.matSelectUser!==undefined){
      this.matSelectUser.valueChange.subscribe(value => {
        this.selected_empID = value.id;
        this.emp = value;
      });
    }
    if (this.matSelectRol!==undefined){
      this.matSelectRol.valueChange.subscribe(value => {
        this.selected_user_role = value.role
        if (this.selected_empID !== ""){
          this.valid_user_select=true;
        }
      })  
    }
  }

  ngOnDestroy(): void {
    //
  }

  confirm_Edit_Dialog(): void {
    this.options_msg.message="¿Confirma la Asignación?";
    this.dialog.open(ConfirmDialogComponent, {data: this.options_msg})
      .afterClosed().subscribe(res=>{
          if (res) { this.Update_User_Employee(); }
      });
  }

  Update_User_Employee(): void{         
    const updating =  this.user_db_Oper.update_User_Employee(this.emp, this.user.uid, this.selected_user_role);
    this.loadSvc.add(updating, {key:"edit_loading"});
    updating.then(() => { this.snackInfo.succes('¡Registro Guardado!');})
            .catch( error => 
                this.showErrorMessage ("Batch Error en Employee ó User Collection: " + error));
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

  isDataLoading(key_loading: string): boolean {
    return this.loadSvc.isLoading({key: key_loading})
  } 
}
