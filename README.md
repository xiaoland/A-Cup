# A-Cup

VSCode extension for sing-box profile editing with intellisense and OSS integration.

## Features

- **Intellisense/Autocomplete**: JSON schema validation and autocompletion for sing-box configuration files
- **OSS Integration**: Upload and download sing-box profiles from Object Storage Service (OSS)

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

## Development

### Prerequisites

- Node.js 20+
- pnpm

### Install & Build

```bash
pnpm install
pnpm run compile
```

### Type Check

```bash
pnpm run check-types
```

### Watch Mode

```bash
pnpm run watch
```

## Resources

- [Sing-Box Configuration Documentation](https://sing-box.sagernet.org/configuration)

## License

MIT
