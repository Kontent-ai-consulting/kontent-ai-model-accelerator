# Kontent.ai Model Accelerator

The purpose of this project is to export & import project structure to & from [Kontent.ai](https://kontent.ai) projects.

Data is both exported and imported via `Management Api` into a dedicated `json` format.

This library can only be used in `node.js`. Use in Browsers is not supported.

## Installation

Install package globally:

`npm i xyz-accelerator -g`

## Use via CLI

### Configuration

| Config                  | Value                                                                                        |
| ----------------------- | -------------------------------------------------------------------------------------------- |
| **environmentId**       | Id of Kontent.ai environment **(required)**                                                  |
| **apiKey**              | Management API key **(required)**                                                            |
| **action**              | One of (`export`, `list`, `remoteImport` or `fileImport`) **(required)**                     |
| **filename**            | Filename used to export or import                                                            |
| **project**             | Codename of the remote project (required for `remoteImport`)                                 |
| **contentTypes**        | Comma separated list of codenames. May be used to import only selected content types         |
| **contentTypeSnippets** | Comma separated list of codenames. May be used to import only selected content type snippets |
| **taxonomies**          | Comma separated list of codenames. May be used to import only selected taxonomies            |
| **debug**               | If set to `true`, full error messages are shown in console log                               |

### Execution

> We do not recommend importing data back to your production environment directly. Instead, we recommend that you create
> a new environment based on your production and test the import first. If the import completes successfully, you may
> swap environments or run it again on the production.

List available templates:

`kda --action=list`

Export:

`kda --action=export --environmentId=xxx --apiKey=yyy --filename=my-export.json`

Import from file:

`kda --action=fileImport --environmentId=xxx --apiKey=yyy --filename=my-export.json`

Remote import:

`kda --action=remoteImport --environmentId=xxx --apiKey=yyy --project=advanced_model`

Remote import - import only parts of model:

`kda --action=remoteImport --environmentId=xxx --apiKey=yyy --project=advanced_model --contentTypes=link --contentTypeSnippets=metadata --taxonomies=persona,product_type`

To get some help you can use:

`kda --help`
