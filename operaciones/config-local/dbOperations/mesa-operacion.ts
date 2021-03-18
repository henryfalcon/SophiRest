export interface MesaOperacion {
    id_operacion: string;
    id_mesa: number;
    mesa_name: string;
    id_mesero: string;
    mesero: string;
    cliente_name?: string;
    comandas: number;
    despachadas: number;
    pendientes: number;    
}
