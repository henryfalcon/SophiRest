import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from "@angular/material/snack-bar"; 

@Injectable({
  providedIn: 'root'
})
export class SnackNotisService {
  constructor(public snackBar: MatSnackBar) { }

  config: MatSnackBarConfig = {
    duration:3000,
    horizontalPosition:'right',
    verticalPosition: 'top'
  }

  succes(msg){
    this.config['panelClass'] = ['notification', 'success'];
    this.snackBar.open(msg, '¡Atención!',this.config);
  }
}
