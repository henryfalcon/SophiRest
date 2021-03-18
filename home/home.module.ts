import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
//routing
import { HomeRoutingModule } from './home-routing.module';
//components
import { HomeComponent } from './home.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { SidenavComponent } from './sidenav/sidenav.component';
import { MenuComponent } from './sidenav/menu/menu.component';
//material
import { MaterialModule } from './material/material.module';
//layout
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
  declarations: [
    HomeComponent, 
    ToolbarComponent, 
    SidenavComponent, 
    MenuComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    MaterialModule,
    HomeRoutingModule,
    FlexLayoutModule,
  ]
})
export class HomeModule { }
