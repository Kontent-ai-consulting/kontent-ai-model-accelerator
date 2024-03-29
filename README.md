# Kontent.ai Model Accelerator

> [!TIP]  
> The idea behind this tool is to export & import content model structures to & from [Kontent.ai](https://kontent.ai)
> environments. Data is both exported and imported via `Management Api` into a specified `json` format.

# Getting started

We recommend running `@kontent-ai-consulting/content-model-accelerator` with `npx`. Use `--help` anytime to get information about available commands and their options.

```bash
npx @kontent-ai-consulting/content-model-accelerator --help

# you can also install the package globally, or locally
npm i @kontent-ai-consulting/content-model-accelerator -g

# with the package installed, you can call the tool as follows
kontent-ai-accelerator --help
```

## Use via CLI

### Configuration

| Config                  | Value                                                                                        |
| ----------------------- | -------------------------------------------------------------------------------------------- |
| **environmentId**       | Id of Kontent.ai environment **(required)**                                                  |
| **apiKey**              | Management API key **(required)**                                                            |
| **action**              | One of (`export`, `list`, `remoteImport` or `fileImport`) **(required)**                     |
| **filename**            | Filename used to export or import                                                            |
| **model**             | Codename of the remote model (required for `remoteImport`)                                 |
| **contentTypes**        | Comma-separated list of codenames. May be used to import only selected content types         |
| **contentTypeSnippets** | Comma-separated list of codenames. May be used to import only selected content type snippets |
| **taxonomies**          | Comma-separated list of codenames. May be used to import only selected taxonomies            |
| **debug**               | If set to `true`, full error messages are shown in console log                               |
| **force**               | If set to `true`, confirmation prompt is disabled                                            |

### Execution

> [!CAUTION]  
> **We do not recommend importing into a production environment directly** (without proper testing). Instead you
> should first create a testing environment and run the script there to make sure everything works as you intended to.

```bash

# List default accelerator models
kontent-ai-accelerator --action=list

# Export existing model to json
kontent-ai-accelerator --action=export --environmentId=xxx --apiKey=yyy --filename=my-export.json

# Import from file to an existing environment
kontent-ai-accelerator --action=fileImport --environmentId=xxx --apiKey=yyy --filename=my-export.json

# Import from the default accelerator model
kontent-ai-accelerator --action=remoteImport --environmentId=xxx --apiKey=yyy --model=advanced_model

# Import only parts from the default accelerator model
kontent-ai-accelerator --action=remoteImport --environmentId=xxx --apiKey=yyy --model=advanced_model --contentTypes=link --contentTypeSnippets=metadata --taxonomies=persona,product_type

# To get some help you can use:
kontent-ai-accelerator --help
```
