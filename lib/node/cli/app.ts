#!/usr/bin/env node
import { readFileSync } from 'fs';
import colors from 'colors';
import yargs from 'yargs';

import {
    ICliFileConfig,
    CliAction,
    handleError,
    confirmImportAsync,
    confirmDataToImportAsync,
    withDefaultLogAsync,
    filterSelectedObjectsToImport
} from '../../core/index.js';
import { ExportService } from '../../export/index.js';
import { ImportService } from '../../import/index.js';
import { FileProcessorService } from '../../file-processor/index.js';
import { getFileService } from '../file/file.service.js';
import { getAcceleratorDataService } from '../../data/accelerator-data.service.js';

const argv = yargs(process.argv.slice(2))
    .example(
        'kontent-ai-accelerator --action=export --apiKey=xxx --environmentId=xxx',
        'Creates json export of content model from given environment'
    )
    .alias('e', 'environmentId')
    .describe('e', 'environmentId')
    .alias('k', 'apiKey')
    .describe('k', 'Management API Key')
    .alias('a', 'action')
    .describe('a', 'Action to perform. One of: "export" | "remoteImport" | "fileImport"')
    .alias('b', 'baseUrl')
    .describe('b', 'Custom base URL for Management API calls.')
    .alias('f', 'filename')
    .describe('f', 'Import / export filename')
    .alias('m', 'model')
    .describe('m', 'Codename of the remote model')
    .alias('ct', 'contentTypes')
    .describe('ct', 'Used to import only selected of content types')
    .alias('cts', 'contentTypeSnippets')
    .describe('cts', 'Used to import only selected of content type snippets')
    .alias('t', 'taxonomies')
    .describe('t', 'Used to import only selected of taxonomies')
    .alias('d', 'debug')
    .describe('d', 'Displays full error message on error')
    .help('h')
    .alias('h', 'help').argv;

const listRemoteAcceleratorsAsync = async () => {
    await withDefaultLogAsync(async (log) => {
        const accelerators = await getAcceleratorDataService().getAllAcceleratorsAsync();

        log({
            type: 'Fetch',
            message: `Fetched '${colors.yellow(accelerators.length.toString())}' accelerator models`
        });

        for (const accelerator of accelerators) {
            log({
                type: 'Model',
                message: `${accelerator.name} (codename: ${colors.cyan(accelerator.codename)})`
            });
        }

        log({
            type: 'Completed',
            message: `All accelerator models listed`
        });
    });
};

const exportAsync = async (config: ICliFileConfig) => {
    await withDefaultLogAsync(async (log) => {
        if (!config.environmentId) {
            throw Error('Invalid environmentId');
        }
        if (!config.apiKey) {
            throw Error('Invalid apiKey');
        }

        const filename: string = getDefaultFilename(config.filename);
        const fileProcessorService = new FileProcessorService();
        const exportService = new ExportService({
            log: log,
            environmentId: config.environmentId,
            apiKey: config.apiKey,
            baseUrl: config.baseUrl
        });

        const fileService = getFileService(log);
        const exportedData = await exportService.exportAllAsync();

        await fileService.writeFileAsync(filename, await fileProcessorService.mapExportToJsonAsync(exportedData));

        log({
            type: 'Completed',
            message: `Export finished successfully`
        });
    });
};

const importFromFile = async (config: ICliFileConfig) => {
    await withDefaultLogAsync(async (log) => {
        const filename: string = getDefaultFilename(config.filename);
        const fileProcessorService = new FileProcessorService();
        const fileService = getFileService(log);

        if (!config.environmentId) {
            throw Error('Invalid environmentId');
        }
        if (!config.apiKey) {
            throw Error('Invalid apiKey');
        }

        const importService = new ImportService({
            log: log,
            baseUrl: config.baseUrl,
            environmentId: config.environmentId,
            apiKey: config.apiKey,
            debug: config.debug ?? false
        });

        await confirmImportAsync({
            log: log,
            force: config.force,
            importService: importService
        });

        const itemsFile = await fileService.loadFileAsync(filename);
        const exportJson = await fileProcessorService.extractJsonFileAsync(itemsFile);

        const dataToImport = filterSelectedObjectsToImport({
            exportJson: exportJson,
            selectedContentTypes: config.contentTypes ?? [],
            selectedContentTypeSnippets: config.contentTypeSnippets ?? [],
            selectedTaxonomies: config.taxonomies ?? []
        });

        await confirmDataToImportAsync({
            log: log,
            force: config.force,
            dataToImport: dataToImport,
            metadata: exportJson.metadata
        });
        await importService.importAsync({
            exportJson: exportJson,
            dataToImport: dataToImport
        });

        log({
            type: 'Completed',
            message: `Import finished successfully`
        });
    });
};

const importFromRemoteAsync = async (config: ICliFileConfig) => {
    await withDefaultLogAsync(async (log) => {
        if (!config.environmentId) {
            throw Error('Invalid environmentId');
        }
        if (!config.apiKey) {
            throw Error('Invalid apiKey');
        }
        if (!config.model) {
            throw Error('Invalid remote model');
        }

        const acceleratorDataService = getAcceleratorDataService();
        const importService = new ImportService({
            log: log,
            baseUrl: config.baseUrl,
            environmentId: config.environmentId,
            apiKey: config.apiKey,
            debug: config.debug ?? false
        });

        await confirmImportAsync({
            log: log,
            force: config.force,
            importService: importService
        });

        log({
            type: 'Fetch',
            message: `Downloading template '${colors.cyan(config.model)}'`
        });

        const model = await acceleratorDataService.getAcceleratorModelByCodenameAsync(config.model);
        const exportJson = await acceleratorDataService.extractJsonFromModelAsync(model);

        const dataToImport = filterSelectedObjectsToImport({
            exportJson: exportJson,
            selectedContentTypes: config.contentTypes ?? [],
            selectedContentTypeSnippets: config.contentTypeSnippets ?? [],
            selectedTaxonomies: config.taxonomies ?? []
        });

        await confirmDataToImportAsync({
            log: log,
            force: config.force,
            dataToImport: dataToImport,
            metadata: exportJson.metadata
        });

        await importService.importAsync({
            exportJson: exportJson,
            dataToImport: dataToImport
        });

        log({
            type: 'Completed',
            message: `Import finished successfully`
        });
    });
};

const run = async () => {
    const config = await getConfig();

    if (config.action === 'export') {
        await exportAsync(config);
    } else if (config.action === 'fileImport') {
        await importFromFile(config);
    } else if (config.action === 'remoteImport') {
        await importFromRemoteAsync(config);
    } else if (config.action === 'list') {
        await listRemoteAcceleratorsAsync();
    } else {
        throw Error(`Invalid action`);
    }
};

const getDefaultFilename = (filename: string | undefined) => {
    return filename ?? 'kontent-ai-export.json';
};

const getConfig = async () => {
    const resolvedArgs = await argv;
    const configFilename: string = (await resolvedArgs.config) as string;

    if (configFilename) {
        // get config from file
        const configFile = readFileSync(`./${configFilename}`);
        return JSON.parse(configFile.toString()) as ICliFileConfig;
    }

    const action: CliAction | undefined = resolvedArgs.action as CliAction | undefined;
    const apiKey: string | undefined = resolvedArgs.apiKey as string | undefined;
    const model: string | undefined = resolvedArgs.model as string | undefined;
    const environmentId: string | undefined = resolvedArgs.environmentId as string | undefined;
    const baseUrl: string | undefined = resolvedArgs.baseUrl as string | undefined;
    const filename: string | undefined = getDefaultFilename(resolvedArgs.filename as string | undefined);

    const contentTypesRaw: string | undefined = resolvedArgs.contentTypes as string | undefined;
    const contentTypeSnippetsRaw: string | undefined = resolvedArgs.contentTypeSnippets as string | undefined;
    const taxonomiesRaw: string | undefined = resolvedArgs.taxonomies as string | undefined;
    const debug: boolean = (resolvedArgs.debug as string | undefined)?.toLowerCase()?.trim() === 'true';
    const force: boolean = (resolvedArgs.force as string | undefined)?.toLowerCase()?.trim() === 'true';

    if (!action) {
        throw Error(`No action was provided`);
    }

    // get config from command line
    const config: ICliFileConfig = {
        action,
        apiKey,
        environmentId,
        debug: debug,
        force: force,
        model: model,
        baseUrl: baseUrl,
        filename: filename,
        contentTypes: contentTypesRaw?.length
            ? contentTypesRaw
                  .trim()
                  .split(',')
                  .filter((m) => m?.length)
                  .map((m) => m.trim())
            : [],
        contentTypeSnippets: contentTypeSnippetsRaw?.length
            ? contentTypeSnippetsRaw
                  .trim()
                  .split(',')
                  .filter((m) => m?.length)
                  .map((m) => m.trim())
            : [],
        taxonomies: taxonomiesRaw?.length
            ? taxonomiesRaw
                  .trim()
                  .split(',')
                  .filter((m) => m?.length)
                  .map((m) => m.trim())
            : []
    };

    return config;
};

run()
    .then((m) => {})
    .catch((error) => {
        handleError(error);
    });
