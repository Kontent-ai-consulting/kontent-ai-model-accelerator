import { ITaxonomiesFormatService } from '../file-processor.models';
import { TaxonomyModels } from '@kontent-ai/management-sdk';
import { IJsonTaxonomy, IJsonTaxonomyTerm } from 'lib/core';

export class TaxonomiesJsonProcessorService implements ITaxonomiesFormatService {
    public readonly name: string = 'json';
    async transformAsync(taxonomies: TaxonomyModels.Taxonomy[]): Promise<IJsonTaxonomy[]> {
        const mappedTaxonomies: IJsonTaxonomy[] = taxonomies.map((taxonomy) => {
            const jsonType: IJsonTaxonomy = {
                codename: taxonomy.codename,
                name: taxonomy.name,
                terms: this.mapTaxonomyTerms(taxonomy.terms)
            };

            return jsonType;
        });
        return mappedTaxonomies;
    }

    async parseAsync(text: string): Promise<IJsonTaxonomy[]> {
        return [];
    }

    private mapTaxonomyTerms(terms: TaxonomyModels.Taxonomy[]): IJsonTaxonomyTerm[] {
        return terms.map((term) => {
            const jsonTerm: IJsonTaxonomyTerm = {
                codename: term.codename,
                name: term.name,
                terms: this.mapTaxonomyTerms(term.terms)
            };

            return jsonTerm;
        });
    }
}
