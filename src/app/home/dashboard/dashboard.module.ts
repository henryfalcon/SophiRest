import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { CarrouselComponent } from './carrousel/carrousel.component';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { CardsComponent } from './cards/cards.component';

@NgModule({
  declarations: [
    DashboardComponent,
    CarrouselComponent,
    CardsComponent, 
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    FlexLayoutModule,
    CarouselModule,
    MatDividerModule,
    MatCardModule
  ]
})
export class DashboardModule { 

  
}
