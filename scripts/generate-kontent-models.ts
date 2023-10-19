import { generateModelsAsync } from '@kontent-ai/model-generator';
import * as dotenv from 'dotenv';
import { rmSync } from 'fs';
import { getEnvironmentRequiredValue, logDebug } from '../lib/core';

const outputDir: string = './lib/models/kontent-ai';

const run = async () => {
    // needed to load .env environment to current process when run via package.json script
    dotenv.config({
        path: './.env.local'
    });

    // delete existing models
    logDebug({
        type: 'Info',
        message: `Deleting existing folder`,
        partA: outputDir
    });
    rmSync(outputDir, {
        recursive: true,
        force: true
    });

    logDebug({
        type: 'Info',
        message: `Folder deleted successfully`,
        partA: outputDir
    });

    logDebug({
        type: 'Info',
        message: `Creating Kontent.ai models`,
        partA: outputDir
    });

    await generateModelsAsync({
        addTimestamp: false,
        addEnvironmentInfo: true,
        environmentId: getEnvironmentRequiredValue('KONTENT_ENVIRONMENT_ID'),
        apiKey: getEnvironmentRequiredValue('KONTENT_MANAGEMENT_API_KEY'),
        sdkType: 'delivery',
        isEnterpriseSubscription: false,
        outputDir: outputDir,
        sortConfig: {
            sortTaxonomyTerms: false
        }
    });
};

run();
