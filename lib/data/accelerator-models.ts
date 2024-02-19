export interface IAccelerator {
    name: string;
    codename: string;
    exportUrl: string;
}

export interface IAcceleratorResponse {
    data: {
        accelerators: IAccelerator[];
    };
}
