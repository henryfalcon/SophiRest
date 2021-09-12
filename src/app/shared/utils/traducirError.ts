import { FbErrorI } from '../interface/fb-error-i';

export class TraducirErrores {
    public traducir(fberr: FbErrorI){
        let msgtouser: string = '';
        let err = fberr;
        switch (err.code) {
            case "auth/email-already-in-use":
                msgtouser = "El email ya está en uso por otro usuario"; break;
            case "auth/wrong-password":
                msgtouser = "Contraseña Incorrecta"; break;
            case "auth/user-not-found":
                msgtouser = "Usuario no encontrado"; break;
            case "auth/network-request-failed":
                msgtouser = "Error en la conexión"; break;                     
            case "auth/invalid-email":
                  msgtouser = "Correo no válido"; break;                               
            case "auth/too-many-requests":
                msgtouser = "Acceso temporalmente deshabilitado por varios intentos fallidos. Debes resetear tu contraseña o tratar mas tarde"; break;
            case  "storage/object-not-found":
                msgtouser = "No se encontró un objeto en storage" + err.message; break;
            case "permission-denied":
                msgtouser = "Permiso de Acceso Denegado. Consulte con el Administrador del Sistema."; break;
            case "auth/network-request-failed":
                msgtouser = "Error en la conexión"; break;
            default:
                msgtouser = err.code + '. ' + err.message; break;
        };
        return msgtouser;
    }
}
