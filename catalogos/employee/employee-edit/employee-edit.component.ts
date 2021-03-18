import { Component, OnInit, Input, ViewChild, AfterViewInit, OnDestroy  } from '@angular/core';
//Reactive Forms
import { FormGroup, FormControl, Validators, FormGroupDirective, NgForm } from '@angular/forms';
//Rxjs
import { BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';
//Services
import { DbOperationsService } from '../dbOperations/db-operations.service';
//Material
import { MatDialog } from '@angular/material/dialog';
import { MatSelect } from '@angular/material/select';
//utils services
import { IsLoadingService } from '@service-work/is-loading';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { SnackNotisService } from '../../../shared/snackBarNotifications/snack-notis.service';
// interfaces
import { EmployeeI } from '../dbOperations/employee-i';
import { DepartmentI } from '../dbOperations/department-i';
import { OptionsMessageI } from '../../../shared/confirm-dialog/options-message-i';
import { UserI } from '../../../shared/interface/user-i';
import { PuestoI } from '../../puesto/dbOperations/puesto-i';


@Component({
  selector: 'app-employee-edit',
  templateUrl: './employee-edit.component.html',
  styleUrls: ['./employee-edit.component.css']
})

export class EmployeeEditComponent implements OnInit, AfterViewInit, OnDestroy {
  options_msg: OptionsMessageI = {title:"Pregunta", message:"", confirmText:"Si", cancelText:"No"};
  emp_updated: EmployeeI;
  selected_userID: string="";
  selected_user_role: string="";
  emphasUser: boolean = false;
  valid_user_selection = new BehaviorSubject(false);
  valid_user_select: boolean = false;
  fotografia_selected: any = undefined;
  subIsUploadingPhoto: boolean;

  employee: EmployeeI;
  user: UserI;
  deptos: DepartmentI[]; 
  puestos: PuestoI[];

  @Input() emp: EmployeeI;
  @ViewChild('matSelectDepto') matSelectDep: MatSelect;
  @ViewChild('matSelectPuesto') matSelectPuesto: MatSelect; 

  constructor( private dbOperations: DbOperationsService,
    private loadSvc: IsLoadingService, 
    private dialog: MatDialog,
    private snackInfo: SnackNotisService ) { }

  public editEmpForm = new FormGroup({
    id: new FormControl(''),
    city: new FormControl('', Validators.required),
    department: new FormControl(''),
    email: new FormControl(''),
    fullname: new FormControl('', Validators.required),
    gender: new FormControl('', Validators. required),
    hiredate: new FormControl('', Validators.required),
    id_depto: new FormControl(''),
    ispermanent: new FormControl('', Validators.required),
    mobile: new FormControl('', Validators.required),
    fotografia: new FormControl(''),
    id_puesto: new FormControl(''),
    puesto: new FormControl(''),
  });

  private initValuesForm(): void {  
    this.editEmpForm.patchValue({
      id: this.emp.id,
      city: this.emp.city,
      department: this.emp.department,
      email: this.emp.email,
      fullname: this.emp.fullname,
      gender: this.emp.gender,
      hiredate:  this.emp.hiredate,
      id_depto: this.emp.id_depto,
      ispermanent: this.emp.ispermanent,
      mobile: this.emp.mobile,
      fotografia: this.emp.fotografia,
      id_puesto: this.emp.id_puesto,
      puesto: this.emp.puesto
    })        
  }

  ngOnInit(): void {
    this.LoadDepartments();
    this.LoadEmployeeUser();
    this.LoadPuestos();
    this.initValuesForm();  
    this.employee = this.emp;
  }

  ngAfterViewInit(): void {
    this.matSelectDep.valueChange.subscribe(value => {        
      this.editEmpForm.patchValue({
        department: value.departamento,
        id_depto: value.id_depto
      });});
    this.matSelectPuesto.valueChange.subscribe(value => {
      this.editEmpForm.patchValue({
        puesto: value.puesto,
        id_puesto: value.id_puesto
      })
    })
  }

  ngOnDestroy(): void {
    this.fotografia_selected=undefined;
    this.matSelectDep.valueChange.unsubscribe();
    this.matSelectPuesto.valueChange.unsubscribe();
  }

  private LoadDepartments() {
    const loading_data = this.dbOperations.getDepartments()
    this.loadSvc.add(loading_data, {key:"edit_loading"});
    loading_data.subscribe( deptos=> this.deptos=deptos, 
      error => { this.showErrorMessage( "Departamentos Collection" + error)});
  }

  private LoadEmployeeUser(){
    if (this.emp.userID != ""){
      const loading_data = this.dbOperations.getUser(this.emp.userID);
      this.loadSvc.add(loading_data, {key:"edit_loading"});
      loading_data.subscribe( user => {
        if (user) {
          this.user = user;
          this.emphasUser = true;
        }
      },        
      error=> { this.showErrorMessage("User Collection" + error)});
    }
  }

  private LoadPuestos(){
    const loading_data = this.dbOperations.getPuestos();
    this.loadSvc.add(loading_data, {key:"edit_loading"});
    loading_data.subscribe( puestos=> this.puestos = puestos,
    error => {this.showErrorMessage("Puestos Collection" + error)});
  }

  isDataLoading(key_loading: string): boolean {
    return this.loadSvc.isLoading({key: key_loading})
  }
  
  compareFuncDepartamentoEmpleado(dep1: any, dep2: any){
    return dep1.id_depto === dep2;
  }

  compareFuncPuesto(puesto1: any,  puesto2: any){
    return puesto1.id_puesto === puesto2;
  }

  showErrorMessage(message: string){
    this.options_msg.title = "Ha ocurrido el siguiente Error:";
    this.options_msg.confirmText ="Ok";
    this.options_msg.isErrorMsg=true;
    this.options_msg.message = message;
    const dialogconfirm = this.dialog.open(ConfirmDialogComponent, {
      data: this.options_msg
    });
    dialogconfirm.afterClosed().pipe(take(1)).subscribe(res=>this.setDefaultConfirmDialogConfig());
  }

  setDefaultConfirmDialogConfig(){
    this.options_msg.title = "Pregunta";
    this.options_msg.confirmText ="Yes";
    this.options_msg.isErrorMsg=false;
  }

  confirm_Edit_Dialog() {
    this.options_msg.message="¿Confirma la Edición del Registro?";
    this.dialog.open(ConfirmDialogComponent, {data: this.options_msg})
      .afterClosed().pipe(take(1)).subscribe(res=>{
          if (res) { this.editEmployee(); }
      });
  }

  confirm_Edit_Photo() {
    this.options_msg.message="¿Confirma la Edición de la Fotografia?";
    this.dialog.open(ConfirmDialogComponent, {data: this.options_msg})
      .afterClosed().pipe(take(1)).subscribe(res=>{
          if (res) { this.Edit_Photo_Employee(); }
      });  
  }

  Edit_Photo_Employee() {
    this.subIsUploadingPhoto = true;    
    const IsNewPhoto: boolean = (this.emp.fotografia==="");
    const updating = this.dbOperations.editPhotoEmployee(this.emp, this.fotografia_selected, IsNewPhoto);
    this.loadSvc.add(updating, {key:"edit_loading"});
    updating.subscribe( 
      url=> { if (url) { 
                let downloadurl: string= "";
                if (IsNewPhoto) { 
                  downloadurl = url; }
                else { 
                  downloadurl = url[1]; }  
                const updating = this.dbOperations.updatePhotoEmployeeandUser(this.emp.id, downloadurl, this.emp.userID)
                this.loadSvc.add(updating, {key:""})
                updating.
                  then(()=>{ this.snackInfo.succes("¡Foto Editada!");
                             this.editEmpForm.patchValue({fotografia: downloadurl});                                                 
                             this.emp.fotografia = downloadurl;
                             this.subIsUploadingPhoto=false;},
                  error => { this.showErrorMessage("Error al guardar los datos de Empleado y Usuario. " + error );  this.subIsUploadingPhoto=false;});
              } else { this.showErrorMessage("Error al subir la foto. No se pudo obtener la url");  this.subIsUploadingPhoto=false;}
            },  
      error => { this.showErrorMessage(error);  
                 this.subIsUploadingPhoto=false;
                 this.emp.fotografia = "";
               });
  }

  editEmployee() {    
    if (this.editEmpForm.valid){
      const editing = this.dbOperations.editEmployeeById(this.editEmpForm.value)
      this.loadSvc.add(editing, {key:"edit_loading"});
      editing.then(()=> { this.snackInfo.succes(':: ¡Registro guardado!');}) 
             .catch(error=>this.showErrorMessage(error));                
    }
  }

  selectFile(event:any):void {
    this.fotografia_selected=event.target.files[0];
    this.confirm_Edit_Photo();
  }
}
