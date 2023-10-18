#!/usr/bin/env node
import { readFileSync } from 'fs';
import * as yargs from 'yargs';

import { ICliFileConfig, CliAction, extractErrorMessage } from '../../core';
import { ExportService } from '../../export';
import { ImportService } from '../../import';
import { FileProcessorService } from '../../file-processor';
import { FileService } from '../file/file.service';
import { logAction } from '../../core/log-helper';

const argv = yargs(process.argv.slice(2))
    .example(
        'kda --action=export --apiKey=xxx --environmentId=xxx',
        'Creates json export of content model from given environment'
    )
    .example(
        'kda --action=import --apiKey=xxx --environmentId=xxx --filename=xxx.json',
        'Read given json file and recreates project structure in Kontent.ai environment'
    )
    .alias('p', 'environmentId')
    .describe('p', 'environmentId')
    .alias('ak', 'apiKey')
    .describe('ak', 'Management API Key')
    .alias('sk', 'secureApiKey')
    .describe('sk', 'API Key required when Delivery API has secure access enabled')
    .alias('a', 'action')
    .describe('a', 'Action to perform. One of: "export" | "import"')
    .alias('b', 'baseUrl')
    .describe('b', 'Custom base URL for Management API calls.')
    .alias('f', 'filename')
    .describe('f', 'Import / export filename')
    .help('h')
    .alias('h', 'help').argv;

const exportAsync = async (config: ICliFileConfig) => {
    const filename: string = getDefaultFilename(config.filename);
    const fileProcessorService = new FileProcessorService();
    const exportService = new ExportService({
        environmentId: config.environmentId,
        apiKey: config.apiKey,
        baseUrl: config.baseUrl
    });

    const fileService = new FileService();
    const exportedData = await exportService.exportAllAsync();

    await fileService.writeFileAsync(filename, await fileProcessorService.mapExportToJsonAsync(exportedData));

    logAction('info', `Completed`);
};

const importAsync = async (config: ICliFileConfig) => {
    const filename: string = getDefaultFilename(config.filename);
    const fileProcessorService = new FileProcessorService();
    const fileService = new FileService();

    const importService = new ImportService({
        baseUrl: config.baseUrl,
        environmentId: config.environmentId,
        apiKey: config.apiKey
    });

    const itemsFile = await fileService.loadFileAsync(filename);
    const extractedData = await fileProcessorService.extractJsonFileAsync(itemsFile);
    await importService.importAsync(extractedData);

    logAction('info', `Completed`);
};

const validateConfig = (config?: ICliFileConfig) => {
    if (!config) {
        throw Error(`Invalid config file`);
    }

    const environmentId = config.environmentId;
    const action = config.action;
    const apiKey = config.apiKey;

    if (!environmentId) {
        throw Error('Invalid environment id');
    }

    if (!action) {
        throw Error('Invalid action');
    }

    if (!apiKey) {
        throw Error('Invalid API Key');
    }
};

const run = async () => {
    const config = await getConfig();

    validateConfig(config);

    if (config.action === 'export') {
        await exportAsync(config);
    } else if (config.action === 'import') {
        await importAsync(config);
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
    const environmentId: string | undefined = resolvedArgs.environmentId as string | undefined;
    const baseUrl: string | undefined = resolvedArgs.baseUrl as string | undefined;
    const filename: string | undefined = getDefaultFilename(resolvedArgs.filename as string | undefined);

    if (!action) {
        throw Error(`No action was provided`);
    }

    if (!apiKey) {
        throw Error(`Invalid API Key`);
    }

    if (!environmentId) {
        throw Error(`Environment id was not provided`);
    }

    // get config from command line
    const config: ICliFileConfig = {
        action,
        apiKey,
        environmentId,
        baseUrl: baseUrl,
        filename: filename
    };

    return config;
};

run()
    .then((m) => {})
    .catch((err) => {
        logAction('error', extractErrorMessage(err));
    });
