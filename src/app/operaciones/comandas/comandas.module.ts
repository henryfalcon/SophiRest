import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
//routing
import { ComandasRoutingModule } from './comandas-routing.module';
//material
import { MaterialModule } from './material/material.module';
//flex layout
import { FlexLayoutModule } from '@angular/flex-layout';
//spinner
import { CustomSpinnerModule } from '../../shared/spinner/custom-spinner.module';
import { MatSpinner } from '@angular/material/progress-spinner';
//tree view
import { TreeviewModule } from 'ngx-treeview';
//components
import { ToolbarMenuComponent } from './toolbar-menu/toolbar-menu.component';
import { TreeViewComponent } from './tree-view/tree-view.component';
import { ComandasComponent } from './comandas.component';
import { NuevaComandaComponent } from './nueva-comanda/nueva-comanda.component';
import { DespacharComandaComponent } from './despachar-comanda/despachar-comanda.component';
import { CantObservComponent } from './nueva-comanda/cant-observ/cant-observ.component';
import { ModalComponent } from './modal/modal.component';
//directiva
import { MatNumberInputComaDirective } from './nueva-comanda/cant-observ/number-input';
import { CancelarComandaComponent } from './cancelar-comanda/cancelar-comanda.component';
import { CerrarComandasComponent } from './cerrar-comanda/cerrar-comandas.component';

@NgModule({
  declarations: [
    ComandasComponent, 
    ToolbarMenuComponent,
    TreeViewComponent, 
    NuevaComandaComponent, 
    DespacharComandaComponent,
    CantObservComponent,
    ModalComponent,
    MatNumberInputComaDirective,
    CancelarComandaComponent,
    CerrarComandasComponent,
  ],
  imports: [
    ComandasRoutingModule,
    CommonModule,    
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MaterialModule,
    CustomSpinnerModule,
    TreeviewModule.forRoot(),
  ],
  entryComponents:[MatSpinner]
})
export class ComandasModule { }
