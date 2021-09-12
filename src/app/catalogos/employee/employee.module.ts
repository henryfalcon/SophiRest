import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule} from '@angular/material/core'
//Route
import { EmployeeRoutingModule } from './employee-routing.module';
//Components
import { EmployeeComponent } from './employee.component';
import { EmployeeListComponent } from './employee-list/employee-list.component';
import { EmployeeAddComponent } from './employee-add/employee-add.component';
import { EmployeeEditComponent } from './employee-edit/employee-edit.component';
import { EmployeeUserComponent } from './employee-edit/employee-user/employee-user.component';
//Modal
import { ModalComponent } from './modal/modal.component';
//Material
import { MaterialModule } from './material/material.module';
//Flex Layout
import { FlexLayoutModule } from '@angular/flex-layout';
//pipe
import { SiNoPipe } from '../../shared/utils/si-no.pipe';
//spinner 
import { CustomSpinnerModule } from '../../shared/spinner/custom-spinner.module';
import { MatSpinner } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';

@NgModule({
  declarations: [
    EmployeeComponent, 
    EmployeeListComponent, 
    EmployeeAddComponent, 
    EmployeeEditComponent,
    EmployeeUserComponent,
    ModalComponent,
    SiNoPipe,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    EmployeeRoutingModule,
    MaterialModule,
    MatNativeDateModule,
    FlexLayoutModule,
    CustomSpinnerModule
  ],
  entryComponents: [MatSpinner],
  providers: [ MatDatepickerModule ]
})
export class EmployeeModule { }
