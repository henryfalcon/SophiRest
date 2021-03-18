import { Component, OnInit, Inject } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { MesaMesero } from '../dbOperations/mesa-mesero';


@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent implements OnInit {

  constructor(public dialog: MatDialogRef<ModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any

  ) {}

  ngOnInit(): void {
  }

  mesa_mesero_config_select(mesa_mesero: MesaMesero){
    console.log("Desde Modal", mesa_mesero)
  }

}
