import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy, Input } from '@angular/core';
//Reactive Forms
import { FormGroup, FormControl, FormGroupDirective, Validators, NgForm } from "@angular/forms";
//Rxjs
import { take } from 'rxjs/operators';
//Services
import { DbOperationsService } from '../dbOperations/db-operations.service';
//Material
import { MatSelect } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import { ErrorStateMatcher } from '@angular/material/core'
//utils services
import { IsLoadingService } from '@service-work/is-loading';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { SnackNotisService } from '../../../shared/snackBarNotifications/snack-notis.service';
//interfaces
import { DepartmentI } from '../dbOperations/department-i';
import { PuestoI } from '../dbOperations/puesto-i';

import { OptionsMessageI } from '../../../shared/confirm-dialog/options-message-i';

export class ValidationsMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-puesto-edit',
  templateUrl: './puesto-edit.component.html',
  styleUrls: ['./puesto-edit.component.css']
})
export class PuestoEditComponent implements OnInit, AfterViewInit, OnDestroy {
  options_msg: OptionsMessageI = {title:"Pregunta", message:"", confirmText:"Si", cancelText:"No"};
  @ViewChild('matSelectDeptos') matSelectDeptos: MatSelect;
  matcher = new ValidationsMatcher();
  deptos: DepartmentI[];
  @Input() puesto: PuestoI; 

  constructor( private dbOperations: DbOperationsService,
    private loadSvc: IsLoadingService, 
    private dialog: MatDialog,
    private snackInfo: SnackNotisService ) { }

  puestoForm: FormGroup = new FormGroup({
    id_puesto: new FormControl(''),
    puesto: new FormControl('', Validators.required),
    departamento: new FormControl('', Validators.required),
    disp_cambio: new FormControl(''),
    disp_viajar: new FormControl(''),
    formacion: new FormControl('', Validators.required),
    habilidades: new FormControl('', Validators.required),
    id_departamento: new FormControl(''),
    requisitos: new FormControl(''),
    remuneracion_de: new FormControl(''),
    remuneracion_hasta: new FormControl(''),
    responsabilidad: new FormControl('', Validators.required),
  });
  
  initValuesForm() {
    //inicializa valores
    this.puestoForm.setValue({
      id_puesto: this.puesto.id_puesto,
      puesto:  this.puesto.puesto,
      departamento: this.puesto.departamento,
      disp_cambio: this.puesto.disp_cambio,
      disp_viajar: this.puesto.disp_viajar,
      formacion: this.puesto.formacion,
      habilidades: this.puesto.habilidades,
      id_departamento: this.puesto.id_departamento,
      requisitos: this.puesto.requisitos,
      remuneracion_de: this.puesto.remuneracion_de,
      remuneracion_hasta: this.puesto.remuneracion_hasta,
      responsabilidad: this.puesto.responsabilidad,  
    })
  };

  private load_departments(){
    const load_deptos = this.dbOperations.getDepartments();
    this.loadSvc.add(load_deptos, {key: "add-loading"});
    load_deptos.subscribe(deps => {this.deptos = deps;}, 
      error => {this.showErrorMessage(error);});    
  }

  ngOnInit(): void {
    this.load_departments();
    this.initValuesForm();
  }

  ngAfterViewInit() {
    this.matSelectDeptos.valueChange.subscribe(value => {
      this.puestoForm.patchValue({
        id_departamento: value.id_depto,
        departamento: value.departamento
      });
    });
  }

  ngOnDestroy(): void {
    this.matSelectDeptos.valueChange.unsubscribe();
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

  isDataLoading(key_loading: string): boolean {
    return this.loadSvc.isLoading({key: key_loading})
  }  

  confirm_Edit_Dialog() {
    this.options_msg.message="¿Confirma la Edición del Registro?";
    this.dialog.open(ConfirmDialogComponent, {data: this.options_msg})
      .afterClosed().pipe(take(1)).subscribe(res=>{
          if (res) { this.editPuesto(); }
      });
  }

  editPuesto(){
    if (this.puestoForm.valid){
      const editing = this.dbOperations.editPuestoById(this.puestoForm.value);
      this.loadSvc.add(editing, {key:"edit-loading"});
      editing.then(()=> {this.snackInfo.succes(':: ¡Registro guardado!')})
             .catch(error=>this.showErrorMessage(error));}              
  }

  compareFuncDepartamentoEmpleado(dep1: any, dep2: any){
    return dep1.id_depto === dep2;
  }
}
