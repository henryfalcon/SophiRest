import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
//menu
import { MenuOperations } from './toolbar-menu/menu-operations'


@Component({
  selector: 'app-comandas',
  templateUrl: './comandas.component.html',
  styleUrls: ['./comandas.component.css']
})

export class ComandasComponent implements OnInit, OnDestroy {
  
  constructor(private menu_items: MenuOperations, private router: Router) {  }

  ngOnInit(): void {
    
  }

  ngOnDestroy(): void {
    this.menu_items.selectedMenu.unsubscribe;
  }

  ngAfterViewInit():void {
    this.menu_items.selectedMenu.subscribe(sel_menu => {
      switch(sel_menu) {
        case 'new_Comanda': {
          this.router.navigate(['./comandas/nueva_comanda']);
          break;
        }
        case 'despachar_Comanda': {
          this.router.navigate(['./comandas/despachar']);
          break;
        }
        case 'cancel_Comanda': {
          this.router.navigate(['./comandas/cancelar_comanda']);
          break;
        }
        default: {
          break;
        }
      }
    })
  }
}
