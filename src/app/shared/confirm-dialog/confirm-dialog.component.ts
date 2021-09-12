import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { OptionsMessageI } from './options-message-i';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.css']
})

export class ConfirmDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data:OptionsMessageI) { 
    //console.log(data);
  }
}