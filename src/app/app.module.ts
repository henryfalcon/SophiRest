import { NgModule, LOCALE_ID } from '@angular/core';
import localeMx from '@angular/common/locales/es-MX';
import {MAT_DATE_LOCALE} from '@angular/material/core';
registerLocaleData(localeMx);
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
//Init Page
import { HomeModule } from './home/home.module';
//Dialog utility
import { ConfirmDialogComponent } from './shared/confirm-dialog/confirm-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
//Material
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
//Flex Layout
import { FlexLayoutModule } from '@angular/flex-layout';
//Angular Fire
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore'
import { environment } from '../environments/environment';
import { BUCKET } from '@angular/fire/storage';
import { registerLocaleData } from '@angular/common';


@NgModule({
  declarations: [
    AppComponent,
    ConfirmDialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HomeModule,
    MatDialogModule,
    MatButtonModule,
    MatSnackBarModule,
    FlexLayoutModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFirestoreModule
  ],
  bootstrap: [AppComponent],
  exports: [ConfirmDialogComponent],
  entryComponents: [ConfirmDialogComponent],
  providers: [
    {provide: BUCKET, useValue: "primerproyectofirebase-f5747.appspot.com"},
    {provide: MAT_DATE_LOCALE, useValue:'es_MX'}
  ]
})
export  class AppModule { }
