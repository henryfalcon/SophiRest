import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CocinaRoutingModule } from './cocina-routing.module';
import { CocinaComponent } from './cocina-component/cocina.component'
import { CocinaComandaComponent } from './cocina-comanda/cocina-comanda.component';

import { MaterialModule } from './material/material.module';
//Flex Layout
import { FlexLayoutModule } from '@angular/flex-layout';
//Modal
import { ModalComponent } from './modal/modal.component';
//spinner
import { CustomSpinnerModule } from '../../shared/spinner/custom-spinner.module';
import { MatSpinner } from '@angular/material/progress-spinner';

@NgModule({
  declarations: [ 
    CocinaComponent,
    ModalComponent,
    CocinaComandaComponent 
  ],
  imports: [
    CommonModule,
    FormsModule,  
    ReactiveFormsModule,
    CocinaRoutingModule,
    MaterialModule,
    CustomSpinnerModule,
    FlexLayoutModule
  ],
  entryComponents:[MatSpinner]
})
export class CocinaModule { }
