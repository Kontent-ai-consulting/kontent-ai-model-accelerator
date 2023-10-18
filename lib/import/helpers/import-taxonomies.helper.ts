import { ManagementClient, TaxonomyModels } from '@kontent-ai/management-sdk';
import { IJsonTaxonomy, logAction } from '../../core';
import { ITargetEnvironmentData } from '../import.models';

export class ImportTaxonomiesHelper {
    async importTaxonomiesAsync(data: {
        managementClient: ManagementClient;
        importTaxonomies: IJsonTaxonomy[];
        existingData: ITargetEnvironmentData;
    }): Promise<TaxonomyModels.Taxonomy[]> {
        const taxonomies: TaxonomyModels.Taxonomy[] = [];

        for (const importTaxonomy of data.importTaxonomies) {
            if (data.existingData.taxonomies.find((m) => m.externalId === importTaxonomy.externalId)) {
                logAction('skip', 'Skipping taxonomy because it already exists', importTaxonomy.name);
            } else {
                logAction('import', 'Import taxonomy', importTaxonomy.name);
                taxonomies.push(
                    (await data.managementClient.addTaxonomy().withData(this.mapTaxonomy(importTaxonomy)).toPromise())
                        .data
                );
            }
        }

        return taxonomies;
    }

    private mapTaxonomy(taxonomy: IJsonTaxonomy): TaxonomyModels.IAddTaxonomyRequestModel {
        return {
            name: taxonomy.name,
            terms: taxonomy.terms ? taxonomy.terms.map((m) => this.mapTaxonomy(m)) ?? [] : [],
            codename: taxonomy.codename,
            external_id: taxonomy.externalId
        };
    }
}

export const importTaxonomiesHelper = new ImportTaxonomiesHelper();
