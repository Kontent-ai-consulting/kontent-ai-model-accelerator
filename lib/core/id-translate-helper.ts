import { IExportAllResult } from '../export';

export interface IIdCodenameTranslationResult {
    [key: string]: string;
}

export class IdTranslateHelper {
    public cleanUnnecessaryProperties(data: any) {
        if (data) {
            if (Array.isArray(data)) {
                for (const arrayItem of data) {
                    this.cleanUnnecessaryProperties(arrayItem);
                }
            } else {
                for (const key of Object.keys(data)) {
                    const val = (data as any)[key];

                    // Remove property with null value
                    if (val === null) {
                        delete data[key];
                    }

                    // Remove property with empty array value
                    if (Array.isArray(val) && val.length === 0) {
                        delete data[key];
                    }

                    if (typeof val === 'object' && val !== null) {
                        this.cleanUnnecessaryProperties(val);
                    }
                }
            }
        }
    }

    public replaceIdReferences(
        data: any,
        exportData: IExportAllResult,
        storedCodenames: IIdCodenameTranslationResult,
        codenameForDefaultId?: string
    ): void {
        if (data) {
            if (Array.isArray(data)) {
                for (const arrayItem of data) {
                    this.replaceIdReferences(arrayItem, exportData, storedCodenames, codenameForDefaultId);
                }
            } else {
                for (const key of Object.keys(data)) {
                    const val = (data as any)[key];

                    if (key.toLowerCase() === 'id') {
                        const id = (data as any).id;

                        // set external_id prop
                        data.external_id = id;

                        // remove id prop
                        delete data.id;
                    }

                    if (typeof val === 'object' && val !== null) {
                        this.replaceIdReferences(val, exportData, storedCodenames, codenameForDefaultId);
                    }
                }
            }
        }
    }
}

export const idTranslateHelper = new IdTranslateHelper();
