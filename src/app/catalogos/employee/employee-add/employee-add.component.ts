import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
//Reactive Forms
import { FormGroup, FormControl, FormGroupDirective, Validators } from "@angular/forms";
//Rxjs
import { take } from 'rxjs/operators';
//Services
import { DbOperationsService } from '../dbOperations/db-operations.service';
//Material
import { MatSelect } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
//utils services
import { IsLoadingService } from '@service-work/is-loading';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { SnackNotisService } from '../../../shared/snackBarNotifications/snack-notis.service';
import { global_Info_System_Service } from '../../../shared/utils/global_info.service';
//interfaces
import { DepartmentI } from '../dbOperations/department-i';
import { PuestoI } from '../../puesto/dbOperations/puesto-i';
import { OptionsMessageI } from '../../../shared/confirm-dialog/options-message-i';


@Component({
  selector: 'app-employee-add',
  templateUrl: './employee-add.component.html',
  styleUrls: ['./employee-add.component.css']
})
export class EmployeeAddComponent  implements OnInit, AfterViewInit, OnDestroy {
  options_msg: OptionsMessageI = {title:"Pregunta", message:"", confirmText:"Si", cancelText:"No"};
  deptos: DepartmentI[]; 
  puestos: PuestoI[];

  @ViewChild('matSelect') matSelect: MatSelect;
  @ViewChild('matSelectPuestos') matSelectPuestos: MatSelect;

  constructor( private dbOperations: DbOperationsService,
               private loadSvc: IsLoadingService, 
               private dialog: MatDialog,
               private global_info: global_Info_System_Service,               
               private snackInfo: SnackNotisService ) {}

  employeeForm: FormGroup = new FormGroup({
    $key: new FormControl(null),
    fullname: new FormControl('', Validators.required),
    email: new FormControl('', Validators.email),
    mobile: new FormControl('', [Validators.required, Validators.minLength(8)]),
    city: new FormControl(''),
    gender: new FormControl(''),
    id_depto: new FormControl(''),
    department: new FormControl(''),
    hiredate: new FormControl(''),
    ispermanent: new FormControl(false),
    id_puesto: new FormControl(''),
    puesto: new FormControl(''),    
  });

  initializeFormGroup() {
    this.employeeForm.setValue({
      $key: null,
      fullName: '',
      email: '',
      mobile: '',
      city: '',
      gender: 'Masculino',
      id_depto: '',
      department: '',
      hiredate: '',
      ispermanent: false,
      id_puesto: '',
      puesto: ''
    });
  }

  private LoadDepartments() {
    const loading_data = this.dbOperations.getDepartments()
    this.loadSvc.add(loading_data, {key:"add-loading"});
    loading_data.subscribe( deptos=> this.deptos=deptos, 
      error => { this.showErrorMessage( "Departamentos Collection" + error)});
  }

  private LoadPuestos() {
    const loading_data = this.dbOperations.getPuestos()
    this.loadSvc.add(loading_data, {key:"add-loading"});
    loading_data.subscribe( puestos=> this.puestos=puestos, 
      error => { this.showErrorMessage( "Departamentos Collection" + error)});  
  }

  ngOnInit(): void {
    this.LoadPuestos();
    this.LoadDepartments();
  }

  ngOnDestroy():void {
    this.matSelect.valueChange.unsubscribe();
    this.matSelectPuestos.valueChange.unsubscribe();
  }

  ngAfterViewInit() {
    this.matSelect.valueChange.subscribe(value => {
      this.employeeForm.patchValue({
        id_depto: value.id_depto,
        department: value.departamento          
      });
    });
    this.matSelectPuestos.valueChange.subscribe(value => {
      this.employeeForm.patchValue({
        id_puesto: value.id_puesto,
        puesto: value.puesto
      });
    });
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

  onSubmit(formDirective: FormGroupDirective){
    if (this.employeeForm.valid){
      const updating = this.dbOperations.addEmployee(this.employeeForm.value);
      this.loadSvc.add(updating, {key:"add-loading"});
      updating.then(()=>{this.snackInfo.succes('¡Registro Guardado!');})
              .catch(error=>this.showErrorMessage(error));
      formDirective.resetForm();
      this.employeeForm.reset();  
    }
  }

  CleanForm():void {
    //limpiar el formulario e inicializarlo
    this.employeeForm.reset();
    this.employeeForm.clearValidators();
  } 

  isDataLoading(key_loading: string): boolean {
    return this.loadSvc.isLoading({key: key_loading})
  }
}
