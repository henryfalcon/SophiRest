import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';    

@Injectable({
    providedIn: 'root'
})

export class MenuOperations {
    public selectedMenu = new BehaviorSubject('none');

    constructor() { }

    public newComanda(){
        this.selectedMenu.next('new_Comanda');       
    }

    public cancelComanda(){
        this.selectedMenu.next('cancel_Comanda');
    }

    public closeComanda(){
        this.selectedMenu.next('close_Comanda');
    }

    public despacharComanda(){
        this.selectedMenu.next('despachar_Comanda');        
    }
}
