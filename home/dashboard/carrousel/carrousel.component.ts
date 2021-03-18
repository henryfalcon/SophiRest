import { Component, OnInit } from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { PlatilloI } from '../../../catalogos/platillo/dbOperations/platillo-i';
//Firestore
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
//Interface
import { FbErrorI } from '../../../shared/interface/fb-error-i';
import { OptionsMessageI } from '../../../shared/confirm-dialog/options-message-i';
//Utils
import { TraducirErrores } from '../../../shared/utils/traducirError';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
//Rxjs
import { throwError } from 'rxjs';
import { catchError, take } from 'rxjs/operators';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-carrousel',
  templateUrl: './carrousel.component.html',
  styleUrls: ['./carrousel.component.css']
})
export class CarrouselComponent implements OnInit {
  private platilloCollection: AngularFirestoreCollection<PlatilloI>;
  private top5_platillos: PlatilloI[]
  private transErr = new TraducirErrores();
  options_msg: OptionsMessageI = {title:"Pregunta", message:"", confirmText:"Si", cancelText:"No", isErrorMsg:false};


  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: false,
    touchDrag: false,
    pullDrag: false,
    dots: true,
    navSpeed: 700,
    navText: ['Anterior', 'Siguiente'],
    autoplay: true,
    autoplayTimeout: 5000,
    autoplayHoverPause: true,
    responsive: {
      0: {items: 1},
      400: {items: 2},
      740: {items: 3},
      940: {items: 4}
    },
    nav: true,
    rewind:true,
  }

  dynamicSlides = [];

  private errorHandler(error: FbErrorI) {
    let trans = new TraducirErrores();
    let errorMsg = trans.traducir(error);
    return throwError(errorMsg);
  }

  constructor( private afs:AngularFirestore, private dialog: MatDialog ) { 
    this.platilloCollection = afs.collection<PlatilloI>('Platillos', ref=>ref.where('dashboard','==',true).limit(5));
  }

  getTopFivePlatillos(){
    let imagen_to_show = "";
    this.platilloCollection.valueChanges().pipe(
      take(1),
      catchError(this.errorHandler)).
      subscribe(plats => {      
        plats.forEach(element => { //if there are          
          imagen_to_show = element.imagen !="" ? element.imagen: imagen_to_show = "https://via.placeholder.com/328x250.png?text=Set+up+this+image+at:+Catalogos/Platillos"; 
          this.dynamicSlides.push(
            { id: element.id, 
              src: imagen_to_show,
              title: element.desc_larga
            }
          );
        });
        if (this.dynamicSlides.length < 5) { //less than 5, fill with default placeholder.com
          for (let i=this.dynamicSlides.length; i <5; i++)
            this.dynamicSlides.push({ 
              id: i, 
              src: "https://via.placeholder.com/328x250.png?text=Set+up+this+image+at:+Catalogos/Platillos",
              title: "Selecciona platillo" }
          )
        }
      }, error => {this.showErrorMessage(error);});
  }

  showErrorMessage(message: string){
    this.options_msg.title = "Ha ocurrido el siguiente Error:";
    this.options_msg.confirmText ="Ok";
    this.options_msg.isErrorMsg=true;
    this.options_msg.message = message;
    const dialogconfirm = this.dialog.open(ConfirmDialogComponent, {
      data: this.options_msg
    });
    dialogconfirm.afterClosed().pipe(take(1)).subscribe(res=>this.setDefaultConfirmDialogConfig());
  }

  setDefaultConfirmDialogConfig(){
    this.options_msg.title = "Pregunta";
    this.options_msg.confirmText ="Yes";
    this.options_msg.isErrorMsg=false;
  }

  ngOnInit(): void {
    //look top five platillos
    this.getTopFivePlatillos();
  }

}
