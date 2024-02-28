import { ContentTypeModels, ManagementClient } from '@kontent-ai/management-sdk';
import colors from 'colors';
import { IJsonContentType, Log } from '../../core/index.js';
import { ITargetEnvironmentData } from '../import.models.js';
import { guidHelper } from '../../helpers/index.js';

export function getImportContentTypesHelper(log?: Log): ImportContentTypesHelper {
    return new ImportContentTypesHelper(log);
}

export class ImportContentTypesHelper {
    constructor(private readonly log?: Log) {}

    async importContentTypesAsync(data: {
        managementClient: ManagementClient;
        importContentTypes: IJsonContentType[];
        existingData: ITargetEnvironmentData;
    }): Promise<ContentTypeModels.ContentType[]> {
        const contentTypes: ContentTypeModels.ContentType[] = [];

        for (const importContentType of data.importContentTypes) {
            const importResult = this.prepareImport(importContentType, data.existingData);

            if (!importResult.canImport) {
                this.log?.({
                    type: 'Skip',
                    message: importResult.message,
                });
                continue;
            }

         this.log?.({
             type: 'Import',
             message: importResult.message,

         });

            contentTypes.push(
                (
                    await data.managementClient
                        .addContentType()
                        .withData((builder) => {
                            return {
                                elements: importContentType.elements,
                                name: importContentType.name,
                                codename: importResult.newCodename ?? importContentType.codename,
                                content_groups: importContentType.contentGroups,
                                external_id: importContentType.externalId
                            };
                        })
                        .toPromise()
                ).data
            );
        }

        return contentTypes;
    }

    private prepareImport(
        type: IJsonContentType,
        existingData: ITargetEnvironmentData
    ): {
        canImport: boolean;
        message: string;
        newCodename?: string;
    } {
        if (existingData.contentTypes.find((m) => m.externalId === type.externalId)) {
            return {
                canImport: false,
                message: `Content type with external id '${colors.yellow(
                    type.externalId
                )}' already exists (${colors.cyan(type.name)})`
            };
        } else if (existingData.contentTypes.find((m) => m.codename === type.codename)) {
            const newCodename: string = `${type.codename}_${guidHelper.shortGuid()}`;

            return {
                canImport: true,
                newCodename: newCodename,
                message: `Content type with codename '${colors.yellow(
                    type.codename
                )}' already exists. Using newly generated codename '${colors.cyan(newCodename)}' instead.`
            };
        }

        return {
            canImport: true,
            message: `Importing content type '${colors.yellow(type.name)}`
        };
    }
}

