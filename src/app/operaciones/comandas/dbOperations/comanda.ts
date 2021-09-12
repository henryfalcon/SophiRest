export interface ComandaI {
    id_operacion: string;
    id_mesa_oper?: string;
    id_comanda: string;
    id_mesa: number;
    mesa_name: string;
    id_mesero: string;
    mesero: string
    cliente_name: string,
    status: string;
    hora_solicitado: Date;
    hora_despachado: Date;
    tiempo_de_entrega: Date;
}
