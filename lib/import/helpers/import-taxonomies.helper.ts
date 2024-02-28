import { ManagementClient, TaxonomyModels } from '@kontent-ai/management-sdk';
import colors from 'colors';
import { IJsonTaxonomy, Log } from '../../core/index.js';
import { ITargetEnvironmentData } from '../import.models.js';
import { guidHelper } from '../../helpers/index.js';

export function getImportTaxonomiesHelper(log?: Log): ImportTaxonomiesHelper {
    return new ImportTaxonomiesHelper(log);
}

export class ImportTaxonomiesHelper {
    constructor(private readonly log?: Log) {}

    async importTaxonomiesAsync(data: {
        managementClient: ManagementClient;
        importTaxonomies: IJsonTaxonomy[];
        existingData: ITargetEnvironmentData;
    }): Promise<TaxonomyModels.Taxonomy[]> {
        const taxonomies: TaxonomyModels.Taxonomy[] = [];

        for (const importTaxonomy of data.importTaxonomies) {
            const importResult = this.prepareImport(importTaxonomy, data.existingData);

            if (!importResult.canImport) {
                this.log?.({
                    type: 'Skip',
                    message: importResult.message
                });

                continue;
            }

            this.log?.({
                type: 'Import',
                message: importResult.message
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
                message: `Taxonomy with external id '${colors.yellow(taxonomy.externalId ?? '')}' (${colors.cyan(taxonomy.name)}) already exists`
            };
        } else if (existingData.taxonomies.find((m) => m.codename === taxonomy.codename)) {
            const newCodename: string = `${taxonomy.codename}_${guidHelper.shortGuid()}`;

            return {
                canImport: true,
                newCodename: newCodename,
                message: `Taxonomy with codename '${colors.yellow(
                    taxonomy.codename
                )}' already exists. Using newly generated codename '${colors.cyan(newCodename)}' instead.`
            };
        }

        return {
            canImport: true,
            message: `Importing taxonomy '${colors.yellow(taxonomy.name)}'`
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
