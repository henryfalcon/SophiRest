import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule} from '@angular/material/core'
//Route
import { PlatilloRoutingModule } from './platillo-routing.module';
//Components
import { PlatilloComponent } from './platillo.component';
import { PlatilloAddComponent } from './platillo-add/platillo-add.component';
import { PlatilloEditComponent } from './platillo-edit/platillo-edit.component';
import { PlatilloListComponent } from './platillo-list/platillo-list.component';
//Modal
import { ModalComponent } from './modal/modal.component';
//Material
import { MaterialModule } from './material/material.module';
//Flex Layout
import { FlexLayoutModule } from '@angular/flex-layout';
//Directive
import { MatNumberInputComaDirective } from '../../shared//utils/number-input';
//spinner
import { CustomSpinnerModule } from '../../shared/spinner/custom-spinner.module';
import { MatSpinner } from '@angular/material/progress-spinner';

@NgModule({
  declarations: [
    PlatilloComponent, 
    PlatilloAddComponent, 
    PlatilloEditComponent, 
    PlatilloListComponent, 
    ModalComponent,
    MatNumberInputComaDirective
  ],
  imports: [
    CommonModule, 
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    PlatilloRoutingModule,
    MatNativeDateModule,
    FlexLayoutModule,
    CustomSpinnerModule
  ],
  entryComponents: [MatSpinner]
})

export class PlatilloModule { }
