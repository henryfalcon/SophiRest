import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
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
import { OptionsMessageI } from '../../../shared/confirm-dialog/options-message-i';

export class ValidationsMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-puesto-add',
  templateUrl: './puesto-add.component.html',
  styleUrls: ['./puesto-add.component.css']
})
export class PuestoAddComponent implements OnInit, AfterViewInit {
  options_msg: OptionsMessageI = {title:"Pregunta", message:"", confirmText:"Si", cancelText:"No"};
  @ViewChild('matSelectDeptos') matSelectDeptos: MatSelect;
  matcher = new ValidationsMatcher();
  deptos: DepartmentI[];

  constructor( private dbOperations: DbOperationsService,
    private loadSvc: IsLoadingService, 
    private dialog: MatDialog,
    private snackInfo: SnackNotisService ) { }

  puestoForm: FormGroup = new FormGroup({
    $key: new FormControl(null),
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

  initializeFormGroup() {
    //inicializa valores default
    this.puestoForm.setValue({
      $key: null,
      puesto: '',
      departamento: '',
      disp_cambio: false,
      disp_viajar: false,
      formacion: '',
      habilidades: '',
      id_departamento: '',
      requisitos: '',
      remuneracion_de: 0,
      remuneracion_hasta: 0,
      responsabilidad: '',  
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

  onSubmit(formDirective: FormGroupDirective){
    if (this.puestoForm.valid) {
      const updating = this.dbOperations.addPuesto(this.puestoForm.value)
      this.loadSvc.add(updating, {key:'add_loading'});
      updating.then(()=>{this.snackInfo.succes('¡Registro Guardado!');})
              .catch(error=>this.showErrorMessage(error));
      formDirective.resetForm();
      this.puestoForm.reset();  
    }
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

  CleanForm():void {
    this.puestoForm.reset();
    this.puestoForm.clearValidators();  
  }

  isDataLoading(key_loading: string): boolean {
    return this.loadSvc.isLoading({key: key_loading})
  }  
}
