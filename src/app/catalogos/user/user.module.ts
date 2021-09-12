import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule} from '@angular/material/core'
//routing
import { UserRoutingModule } from './user-routing.module';
//spinner
import { CustomSpinnerModule } from '../../shared/spinner/custom-spinner.module';
import { MatSpinner } from '@angular/material/progress-spinner';
//Modal
import { ModalComponent } from './modal/modal.component';
//Material
import { MaterialModule } from './material/material.module';
//component 
import { UserComponent } from './user.component';
import { UserListComponent } from './user-list/user-list.component';
import { UserEditComponent } from './user-edit/user-edit.component';
//pipe
import { SiNoPipe } from './si-no.pipe';

@NgModule({
  declarations: [
    UserComponent,
    ModalComponent,
    UserListComponent,
    UserEditComponent,
    SiNoPipe
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    UserRoutingModule,
    MatNativeDateModule,
    CustomSpinnerModule,
    MaterialModule
  ],
  entryComponents: [MatSpinner]
})
export class UserModule { }
