export interface DataInfo {
    Columns: { [key: string]: string };
    Litologia: LitologiaStruc;
}

export interface ProjectInfo {
    Name: string;
    Owner: string;
    Members: Members;
    CreationDate: string;
    Description: string;
    Location: string;
    Lat: number;
    Long: number;
    Visible: boolean;
}

export interface Members {
    Owner: string;
    Editors: string[];
    Readers: string[];
}

export interface Col {
    Name: string;
    Visible: boolean;
    Removable: boolean;
}

export interface LitologiaStruc {
    ColorFill: string;
    ColorStroke: string;
    File: string;
    Contact: string;
    Zoom: number;
    Rotation: number;
    Height: number;
    Tension: number;
    Circles: Circles[];
}

export interface Circles {
    X: number;
    Y: number;
    Radius: number;
    Movable: boolean;
    Name: string;
}

export interface Fosil {
    Upper: number;
    Lower: number;
    FosilImg: string;
    X: number;
}

export interface Muestra {
    Upper: number;
    Lower: number;
    MuestraText: string;
    X: number;
}

export interface Facies {
    y1: number;
    y2: number;
}

export interface EditingUser {
    id: string;
    name: string;
    color: string;
}

export interface User {
    name: string;
    color: string;
}

// Formularios del editor
export interface formData {
    index: any;
    column: any;
    File: string;
    ColorFill: string;
    ColorStroke: string;
    Zoom: number;
    Tension: number;
    initialHeight: number;
    Height: number;
    Rotation: number;
    text: string;
    Contact: string;
} 

export interface formFosil {
    id: string;
    upper: number;
    lower: number;
    fosilImg: string;
    x: number;
    fosilImgCopy: string;
}

export interface formMuestra {
    id: string;
    upper: number;
    lower: number;
    muestraText: string;
    x: number;
    muestraTextCopy: string;
}

export interface formFacies {
    facie: string;
    y1: number;
    y2: number;
    y1prev: number;
    y2prev: number;
}