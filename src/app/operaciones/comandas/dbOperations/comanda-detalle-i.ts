export interface ComandaDetalleI {   
    id_comanda: string, 
    id_mesa_oper?: string
    id_detalle?: string,
    id_platillo: string,
    platillo: string,
    acompanamiento: string,
    cant: number,
    precio: number,
    subtotal: number,
    observacion: string,
    status: string
}
