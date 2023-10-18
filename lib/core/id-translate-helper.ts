import { IExportAllResult } from 'lib/export';
import { logAction } from './log-helper';

export interface IIdCodenameTranslationResult {
    [key: string]: string;
}

export class IdTranslateHelper {
    private readonly defaultObjectId: string = '00000000-0000-0000-0000-000000000000';

    public cleanUnnecessaryProperties(data: any) {
        if (data) {
            if (Array.isArray(data)) {
                for (const arrayItem of data) {
                    this.cleanUnnecessaryProperties(arrayItem);
                }
            } else {
                for (const key of Object.keys(data)) {
                    const val = (data as any)[key];

                    // Remove Id property
                    if (key.toLowerCase() === 'id') {
                        delete data.id;
                    }

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

    public replaceIdReferencesWithCodenames(
        data: any,
        exportData: IExportAllResult,
        storedCodenames: IIdCodenameTranslationResult,
        codenameForDefaultId?: string
    ): void {
        if (data) {
            if (Array.isArray(data)) {
                for (const arrayItem of data) {
                    this.replaceIdReferencesWithCodenames(arrayItem, exportData, storedCodenames, codenameForDefaultId);
                }
            } else {
                for (const key of Object.keys(data)) {
                    const val = (data as any)[key];
                    if (key.toLowerCase() === 'id') {
                        const id = (data as any).id;
                        const codename = (data as any).codename;

                        if (!codename) {
                            let foundCodename: string | undefined;
                            if (id.toLowerCase() === this.defaultObjectId.toLowerCase() && codenameForDefaultId) {
                                foundCodename = codenameForDefaultId;
                            } else {
                                foundCodename = this.tryFindCodenameForId(id, exportData, storedCodenames);
                            }

                            // replace id with codename
                            if (foundCodename) {
                                // remove id prop
                                delete data.id;

                                // set codename prop
                                data.codename = foundCodename;
                            } else {
                                logAction('warning', `Could not find codename for object with id '${id}'`);
                            }
                        }
                    }

                    if (typeof val === 'object' && val !== null) {
                        this.replaceIdReferencesWithCodenames(val, exportData, storedCodenames, codenameForDefaultId);
                    }
                }
            }
        }
    }

    private tryFindCodenameForId(
        findId: string,
        data: any,
        storedCodenames: IIdCodenameTranslationResult,
        foundCodename?: string
    ): string | undefined {
        // try looking up codename in stored references
        const storedCodename = storedCodenames[findId];

        if (storedCodename) {
            return storedCodename;
        }

        if (data) {
            if (Array.isArray(data)) {
                for (const arrayItem of data) {
                    foundCodename = this.tryFindCodenameForId(findId, arrayItem, storedCodenames, foundCodename);
                }
            } else {
                for (const key of Object.keys(data)) {
                    const val = (data as any)[key];
                    let candidateId: string | undefined;

                    if (key.toLowerCase() === 'id') {
                        candidateId = (data as any).id;
                    }

                    if (key.toLocaleLowerCase() === 'external_id') {
                        candidateId = (data as any).external_id;
                    }

                    if (candidateId) {
                        const codename = (data as any).codename;

                        if (codename) {
                            // store id -> codename mapping so that we don't have to always
                            // search for it as its expensive operation
                            storedCodenames[candidateId] = codename;
                        }

                        if (codename && candidateId === findId) {
                            return codename;
                        }
                    }
                    if (typeof val === 'object' && val !== null) {
                        foundCodename = this.tryFindCodenameForId(findId, val, storedCodenames, foundCodename);
                    }
                }
            }
        }
        return foundCodename;
    }
}

export const idTranslateHelper = new IdTranslateHelper();
