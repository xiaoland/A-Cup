# A-Cup

VSCode extension for sing-box profile editing with intellisense and OSS integration.

## Features

- **Intellisense/Autocomplete**: JSON schema validation and autocompletion for sing-box configuration files
- **OSS Integration**: Upload and download sing-box profiles from Object Storage Service (OSS)
- **Language Server**: Dedicated LSP for advanced sing-box configuration support

## Supported File Patterns

The extension automatically provides intellisense for files matching:
- `*.sing-box.json`
- `*sing-box*.json`

## Extension Settings

This extension contributes the following settings:

* `a-cup.oss.endpoint`: OSS endpoint URL
* `a-cup.oss.accessKeyId`: OSS access key ID
* `a-cup.oss.accessKeySecret`: OSS access key secret
* `a-cup.oss.bucket`: OSS bucket name

## Commands

* `A-Cup: Upload Profile to OSS` - Upload the current file to configured OSS
* `A-Cup: Download Profile from OSS` - Download a profile from configured OSS

## Project Structure

This is a pnpm monorepo with the following structure:

```
├── packages/
│   ├── extension/     # VSCode extension main process
│   ├── webview/       # Vite + Vue3 UI components
│   └── lsp/           # Language Server Protocol implementation
├── shared/            # Shared types, utils, and schemas
├── .github/workflows/ # CI/CD workflows
├── tsconfig.json      # Root TypeScript config
├── package.json       # Workspace configuration
└── pnpm-workspace.yaml
```

## Development

### Prerequisites

- Node.js 20+
- pnpm 8+

### Install & Build

```bash
pnpm install
pnpm build
```

### Development Mode

```bash
pnpm dev
```

### Testing

```bash
pnpm test
```

### Type Check

```bash
pnpm check-types
```

### Package Extension

```bash
pnpm vsce:package
```

## Resources

- [Sing-Box Configuration Documentation](https://sing-box.sagernet.org/configuration)

## License

MIT
