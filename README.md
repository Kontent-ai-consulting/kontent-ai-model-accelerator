# Kontent.ai Model Accelerator

The purpose of this project is to export & import project structure to & from [Kontent.ai](https://kontent.ai) projects.

Data is both exported and imported via `Management Api` into a dedicated `json` format.

This library can only be used in `node.js`. Use in Browsers is not supported.

## Installation

Install package globally:

`npm i xyz-accelerator -g`

## Use via CLI

### Configuration

| Config            | Value                                                                                                                                                                                                                         |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **environmentId** | Id of Kontent.ai environment **(required)**                                                                                                                                                                                       |
| **apiKey**        | Content Management Api key **(required)**                                                                                                                                                   |
| **action**        | Action. Available options: `import` & `export` **(required)**            |                                                                                                                                                    |
                                                                                                                                                              |
| exportFilename     | Optional filename when exporting data                                                                                                                                                                        |
| importFilename      | Name of the import file                                                                                                                                                                        |


### Execution

> We do not recommend importing data back to your production environment directly. Instead, we recommend that you create
> a new environment based on your production and test the import first. If the import completes successfully,
> you may swap environments or run it again on the production.

Export:

`kda --action=export --environmentId=xxx --exportFilename=items-backup.zip`

To get some help you can use:

`kda --help`

