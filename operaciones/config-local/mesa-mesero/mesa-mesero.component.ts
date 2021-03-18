import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
//Reactive Forms
import { FormControl, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
//Rxjs
import { take } from 'rxjs/operators';
//interface
import { MesaMesero } from '../dbOperations/mesa-mesero';
import { OptionsMessageI } from '../../../shared/confirm-dialog/options-message-i';
//Material
import { MatSelect } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
//servicio
import { DbOperationsService } from '../dbOperations/db-operations.service';
import { IsLoadingService } from '@service-work/is-loading';
import { EmployeeI } from 'src/app/catalogos/employee/dbOperations/employee-i';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-mesa-mesero',
  templateUrl: './mesa-mesero.component.html',
  styleUrls: ['./mesa-mesero.component.css']
})
export class MesaMeseroComponent implements OnInit {
  options_msg: OptionsMessageI = {title:"Pregunta", message:"", confirmText:"Si", cancelText:"No"};  
  @Input() mesaMesero_Input: MesaMesero;
  @ViewChild('matSelectMeseros') matSelectMeseros: MatSelect;
  mesa_mesero: MesaMesero;
  meseros: EmployeeI[];
  
  constructor ( private dbOper: DbOperationsService,
                private loadSvc: IsLoadingService,
                private dialog: MatDialog
              ) { }

  mesasForm: FormGroup = new FormGroup({
    id_mesa: new FormControl(''),
    mesa_name: new FormControl('', Validators.required),
    id_mesero: new FormControl(''),
    mesero: new FormControl('', Validators.required),
  })

  initializeFormGroup(){
    this.mesasForm.setValue({
      id_mesa: this.mesa_mesero.id_mesa,
      mesa_name: this.mesa_mesero.mesa_name,
      id_mesero: 0,
      mesero: ''
    })
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

  loadMeseros(){
    const loading_data = this.dbOper.getMeseros();
    this.loadSvc.add(loading_data, {key:'loading-meseros'});
    loading_data.subscribe( meseros => this.meseros = meseros, 
      error => { this.showErrorMessage( "Departamentos Collection" + error)});      
  }

  ngOnInit(): void {
    this.mesa_mesero = this.mesaMesero_Input;
    this.initializeFormGroup();
    this.loadMeseros();
  }

  ngAfterViewInit(): void {
    this.matSelectMeseros.valueChange.subscribe(value=>{
      this.mesasForm.patchValue({
        id_mesero: value.id,
        mesero: value.fullname
      })
      this.mesa_mesero = this.mesasForm.value;
    })
  }

  onSubmit(formDirective: FormGroupDirective){
    if (this.mesasForm.valid){
      formDirective.resetForm();
    }    
  }

  isDataLoading(key_loading: string): boolean {
    return this.loadSvc.isLoading({key:key_loading});
  }
}
