export interface PlatilloI {
    id?: string;
    desc_corta: string;
    desc_larga: string;
    fecha_alta: Date;
    ingredientes: string;
    costo: number;
    precio: number;
    status: string;
    tiempo_prep: string;
    imagen?: any;
    fileRef?: string;
    guarnicion: string;
    acompanamiento: string;
    id_categoria: string;
    categoria: string;
    tiempo_alimento: string;
    dashboard: boolean;
}
