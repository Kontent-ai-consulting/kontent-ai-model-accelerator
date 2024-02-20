import { ManagementClient, TaxonomyModels } from '@kontent-ai/management-sdk';
import { IJsonTaxonomy, logDebug } from '../../core';
import { ITargetEnvironmentData } from '../import.models';
import { guidHelper } from '../../helpers/index';

export class ImportTaxonomiesHelper {
    async importTaxonomiesAsync(data: {
        managementClient: ManagementClient;
        importTaxonomies: IJsonTaxonomy[];
        existingData: ITargetEnvironmentData;
    }): Promise<TaxonomyModels.Taxonomy[]> {
        const taxonomies: TaxonomyModels.Taxonomy[] = [];

        for (const importTaxonomy of data.importTaxonomies) {
            const importResult = this.prepareImport(importTaxonomy, data.existingData);

            if (!importResult.canImport) {
                logDebug({
                    type: 'Skip',
                    message: importResult.message,
                    partA: importTaxonomy.codename
                });

                continue;
            }

            logDebug({
                type: 'Import',
                message: importResult.message,
                partA: importTaxonomy.codename
            });

            taxonomies.push(
                (
                    await data.managementClient
                        .addTaxonomy()
                        .withData(this.mapTaxonomy(importTaxonomy, importResult.newCodename))
                        .toPromise()
                ).data
            );
        }

        return taxonomies;
    }

    private prepareImport(
        taxonomy: IJsonTaxonomy,
        existingData: ITargetEnvironmentData
    ): {
        canImport: boolean;
        message: string;
        newCodename?: string;
    } {
        if (existingData.taxonomies.find((m) => m.externalId === taxonomy.externalId)) {
            return {
                canImport: false,
                message: `Taxonomy with external id '${taxonomy.externalId}' already exists`
            };
        } else if (existingData.taxonomies.find((m) => m.codename === taxonomy.codename)) {
            const newCodename: string = `${taxonomy.codename}_${guidHelper.shortGuid()}`;

            return {
                canImport: false,
                newCodename: newCodename,
                message: `Taxonomy with codename '${taxonomy.codename}' already exists. Using newly generated codename '${newCodename}' instead.`
            };
        }

        return {
            canImport: true,
            message: 'Importing taxonomy'
        };
    }

    private mapTaxonomy(
        taxonomy: IJsonTaxonomy,
        newTaxonomyCodename: string | undefined
    ): TaxonomyModels.IAddTaxonomyRequestModel {
        return {
            name: taxonomy.name,
            terms: taxonomy.terms ? taxonomy.terms.map((m) => this.mapTaxonomy(m, undefined)) ?? [] : [],
            codename: newTaxonomyCodename ?? taxonomy.codename,
            external_id: taxonomy.externalId
        };
    }
}

export const importTaxonomiesHelper = new ImportTaxonomiesHelper();
