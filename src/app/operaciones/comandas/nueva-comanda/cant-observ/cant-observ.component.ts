import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { OptionsMessageI } from './options-message-i';
import { CantObservI } from './cant-observ-i';

@Component({
  selector: 'app-cant-observ',
  templateUrl: './cant-observ.component.html',
  styleUrls: ['./cant-observ.component.css']
})

export class CantObservComponent {
  
  cant_observ: CantObservI = {no:0, observacion:"", cant2:2 };
  constructor(
    @Inject(MAT_DIALOG_DATA) public data:OptionsMessageI,
    private dialogRef: MatDialogRef<CantObservComponent>) {}

  ReportCantObserv(cant: string, observacion:string) {
    let new_cant:number = cant.trim() != ""?  parseInt(cant) : 0;
    this.cant_observ.observacion = observacion;
    this.cant_observ.no = 0;
    this.cant_observ.cant2 = new_cant;
    this.dialogRef.close(this.cant_observ);
  }

  NoDataProvide() {
    this.dialogRef.close();
  }
}
