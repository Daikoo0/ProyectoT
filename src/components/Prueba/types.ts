export interface DataInfo {
    Columns: { [key: string]: string };
    Litologia: LitologiaStruc;
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
    Circles: any[];
}