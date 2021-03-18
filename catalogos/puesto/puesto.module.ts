import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule} from '@angular/material/core'
//Route
import { PuestoRoutingModule } from './puesto-routing.module';
//Modal
import { ModalComponent } from './modal/modal.component';
//Material
import { MaterialModule } from './material/material.module';
//Components
import { PuestoComponent } from './puesto.component';
import { PuestoAddComponent } from './puesto-add/puesto-add.component';
import { PuestoListComponent } from './puesto-list/puesto-list.component';
import { PuestoEditComponent } from './puesto-edit/puesto-edit.component';
//Flex Layout
import { FlexLayoutModule } from '@angular/flex-layout';
//pipe
import { SiNoPipe } from './si-no.pipe';
//Directive
import { MatNumberInputComaDirective } from './number-input';
//spinner 
import { CustomSpinnerModule } from '../../shared/spinner/custom-spinner.module';
import { MatSpinner } from '@angular/material/progress-spinner';


@NgModule({
  declarations: [
    PuestoComponent, 
    PuestoAddComponent, 
    PuestoListComponent, 
    PuestoEditComponent,
    ModalComponent,
    SiNoPipe,
    MatNumberInputComaDirective
  ],
  imports: [
    CommonModule,
    PuestoRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    MatNativeDateModule,
    FlexLayoutModule,
    CustomSpinnerModule
  ],
  entryComponents: [MatSpinner]
})
export class PuestoModule { }
