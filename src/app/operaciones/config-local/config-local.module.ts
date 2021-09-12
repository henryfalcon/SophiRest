import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
//components
import { ConfigLocalRoutingModule } from './config-local-routing.module';
import { ConfigLocalComponent } from './config-local.component';
import { MesaMeseroComponent } from './mesa-mesero/mesa-mesero.component';
//material
import { MaterialModule } from './material/material.module';
import { MatNativeDateModule } from '@angular/material/core';
import { NgxMaterialTimepickerModule} from 'ngx-material-timepicker';
//Modal
import { ModalComponent } from './modal/modal.component';
//spinner 
import { CustomSpinnerModule } from '../../shared/spinner/custom-spinner.module';

@NgModule({
  declarations: [
    ConfigLocalComponent, 
    MesaMeseroComponent,
    ModalComponent
  ],
  imports: [
    CommonModule,
    ConfigLocalRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    CustomSpinnerModule,
    MatNativeDateModule,
    NgxMaterialTimepickerModule
  ]
})
export class ConfigLocalModule { }
