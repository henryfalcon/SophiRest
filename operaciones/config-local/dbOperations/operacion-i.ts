
export interface OperacionI {
    id_operacion: string;
    id_config?: string;
    config_name?: string;
    corteZ: number;
    total_Operaciones:number;
    id_usuario: string
    id_company: string;
    fecha_registro: Date;
    fecha_hora_termino?: Date;
    estado: string;
    mesas?: number;
    meseros?: number;
}
