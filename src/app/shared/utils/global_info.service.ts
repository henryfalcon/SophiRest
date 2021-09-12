import { Injectable } from '@angular/core';
//interfaces
import { GlobalInformation } from '../interface/global_info';

@Injectable({
    providedIn: 'root'
})

export class global_Info_System_Service {
    private global_info: GlobalInformation    
    
    public get get_user_info_service(): GlobalInformation{
        return this.global_info;
    }

    public set set_user_info_service( info: GlobalInformation ){
        this.global_info = info;
    }

    public set_user_info_null_service(){
        this.global_info.user_id= ""
        this.global_info.user_email= ""
        this.global_info.email_verified= false;
        this.global_info.displayName= ""
        this.global_info.photoURL= ""
        this.global_info.role = "GUEST";
        this.global_info.employeeID= ""
        this.global_info.employee_email= ""
        this.global_info.id_company= ""
        this.global_info.company_name= "Sophi-Rest v.1.0"
        this.global_info = null;
    }

}