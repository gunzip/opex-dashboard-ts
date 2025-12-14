# OpEx Dashboard

**Generate standardized PagoPA's Operational Excellence dashboards from OpenAPI
3 specifications.**

## Features

- **Automatic Dashboard Generation** - Parses OpenAPI 3 specs to create
  standardized operational dashboards
- **Multiple Cloud Providers** - Azure (current), AWS CloudWatch, Grafana
  (planned)
- **High Performance** - Parallel rendering with deterministic ordering
- **Type-Safe** - Full TypeScript with Zod runtime validation

## What It Does

| Template            | Description                                             | Status   |
| ------------------- | ------------------------------------------------------- | -------- |
| azure-dashboard     | Terraform configuration for Azure Dashboard with alarms | ✅ Ready |
| azure-dashboard-raw | Raw JSON representation of Azure Dashboard              | ✅ Ready |
| aws                 | CloudWatch Dashboard JSON                               | ⚒️ N/A   |
| grafana             | Grafana Dashboard JSON                                  | ⚒️ N/A   |

OpEx Dashboard is distributed as an **npm package** with two components:

- **CLI tool** (`opex_dashboard`) - Command-line interface for end users
- **TypeScript library** - Programmatic API for integration

## Installation

### Global Installation

```bash
npm install -g opex-dashboard
```

### Use with npx

```bash
npx opex-dashboard generate --help
```

### Local Development

```bash
git clone https://github.com/pagopa/opex-dashboard.git
cd opex-dashboard
npm install
npm run build
```

## Quick Start

### 1. Create Configuration File

```yaml
# config.yaml
oa3_spec: ./openapi.yaml # or HTTP URL
name: My API Dashboard
location: West Europe
resource_type: app-gateway
data_source: /subscriptions/xxx/resourceGroups/my-rg/providers/Microsoft.Network/applicationGateways/my-gtw
action_groups:
  - /subscriptions/xxx/resourceGroups/my-rg/providers/microsoft.insights/actionGroups/my-alerts
```

### 2. Generate Dashboard

```bash
# Output to stdout
opex_dashboard generate -t azure-dashboard-raw -c config.yaml

# Save as Terraform package
opex_dashboard generate -t azure-dashboard -c config.yaml --package ./output
```

### 3. Deploy with Terraform

```bash
cd output/azure-dashboard
terraform init -backend-config=env/dev/backend.tfvars
terraform apply -var-file=env/dev/terraform.tfvars
```

## Dashboard Components

For each endpoint in the OpenAPI spec, the dashboard includes:

### Graphs

1. **Availability**: HTTP success rate (status codes < 500)
2. **Response Codes**: Segmentation of all HTTP status codes (1XX, 2XX, 3XX,
   4XX, 5XX)
3. **Response Time**: 95th percentile response time

### Alarms

1. **Availability Alarm**: Triggers when availability drops below threshold
   (default: 99%)
2. **Response Time Alarm**: Triggers when response time exceeds threshold
   (default: 1 second)

### Configurable Parameters

For each alarm, you can configure:

- **Timespan** _(Default: 5m)_ - The aggregation window
- **Evaluation Frequency** _(Default: 10 minutes)_ - How often to evaluate the
  rule
- **Time Window** _(Default: 20 minutes)_ - Data fetch window (must be ≥
  evaluation frequency)
- **Event Occurrences** _(Default: 1)_ - Number of events needed to trigger
  alert

**NOTE:** Maximum event occurrences = time window ÷ timespan. For example, with
a 30m window and 5m timespan, max is 6 events.

## Usage

### CLI Commands

```bash
opex_dashboard generate [options]

Options:
  -t, --template-type <type>    Template type: azure-dashboard or azure-dashboard-raw (required)
  -c, --config <path>           Path to YAML config file, use - for stdin (required)
  --package [path]              Save as package in directory (default: current dir)
  -h, --help                    Display help
  -V, --version                 Display version
```

### Configuration

Create a YAML configuration file:

```yaml
# Required fields
oa3_spec: string # Path or URL to OpenAPI 3 specification
name: string # Dashboard name
location: string # Azure region (e.g., "West Europe")
data_source: string # Azure resource ID
action_groups: string[] # Array of Azure Action Group IDs

# Optional fields (with defaults)
resource_type: app-gateway | api-management # Default: app-gateway
timespan: string # Default: 5m
evaluation_frequency: number # Default: 10 (minutes)
evaluation_time_window: number # Default: 20 (minutes)
event_occurrences: number # Default: 1

# Override defaults for specific endpoints
overrides:
  hosts: # Use custom hosts instead of spec hosts
    - https://api.example.com
  endpoints:
    /api/v1/users/{id}:
      availability_threshold: 0.95
      response_time_threshold: 2
      # ... (see examples/ for full options)
```

See [`examples/`](./examples) directory for complete configuration samples.

#### JSON Schema Validation

A JSON Schema is automatically generated from the TypeScript types and included
at [`config.schema.json`](./config.schema.json). This enables IDE autocomplete
and validation for your configuration files.

To enable schema validation in VS Code and other compatible editors, add this
comment at the top of your YAML configuration file:

```yaml
# yaml-language-server: $schema=./config.schema.json
```

The schema is:

- **Automatically generated** during build from Zod schemas using
  `npm run generate:schema`
- **Synchronized** with TypeScript types - any changes to configuration
  structure are reflected immediately
- **Versioned** - matches the package version for compatibility tracking
- **Distributed** with the npm package for programmatic access

### Programmatic Usage

```typescript
import { createBuilder, OA3Resolver, loadConfig } from "opex-dashboard";

// Load configuration
const config = loadConfig("./config.yaml");

// Create resolver
const resolver = new OA3Resolver(config.oa3_spec);

// Create builder
const builder = await createBuilder("azure-dashboard", {
  resolver,
  name: config.name,
  resource_type: config.resource_type,
  location: config.location,
  timespan: config.timespan,
  evaluation_frequency: config.evaluation_frequency,
  evaluation_time_window: config.evaluation_time_window,
  event_occurrences: config.event_occurrences,
  resources: [config.data_source],
  data_source_id: config.data_source,
  action_groups_ids: config.action_groups,
});

// Generate dashboard
const output = builder.produce(config.overrides || {});
console.log(output);
```

## Architecture

### Project Structure

```
src/
├── builders/          # Builder pattern implementation
├── cli/               # CLI implementation
├── core/              # Core functionality
│   ├── config/        # Configuration loading & validation
│   ├── errors/        # Custom error classes
│   ├── resolver/      # OpenAPI spec parsing
│   └── template/      # Template engine
├── tags/              # Template filters
├── utils/             # Utility functions
└── constants/         # Constants and defaults

assets/
├── templates/         # Dashboard templates
│   ├── azure_dashboard_raw.json
│   ├── azure_dashboard_terraform.tf
│   ├── app-gateway_queries/
│   └── api-management_queries/
└── terraform/         # Terraform boilerplate
```

### Design Patterns

- **Builder Pattern**: Separates dashboard construction from representation
- **Factory Pattern**: Type-safe builder creation
- **Composition**: Terraform builder wraps raw JSON builder

## Development

### Setup

```bash
npm install
npm run build
```

### Scripts

```bash
npm run build            # Compile TypeScript
npm run dev              # Watch mode
npm run typecheck        # Type checking
npm test                 # Run tests
npm run test:watch       # Test watch mode
npm run test:coverage    # Coverage report
npm run test:unit        # Run unit tests only
npm run test:integration # Run integration tests only
npm run lint             # ESLint
```

### Testing

The project includes comprehensive unit and integration tests with Vitest:

- **Unit Tests** (`test/unit/`) - Test individual functions and components
- **Integration Tests** (`test/integration/`) - Test end-to-end workflows
- **Coverage Thresholds**: 80% for statements, lines, and functions; 60% for
  branches

Run tests with automatic cleanup:

```bash
npm test                 # Run all tests
npm run test:coverage    # Run with coverage report
npm run test:watch       # Watch mode for TDD
```

Tests automatically:

- Clean up temporary directories after each test
- Use unique temp directories to avoid conflicts
- Validate outputs against existing fixtures

### Code Style

- TypeScript strict mode enabled
- No `any` types - Use `unknown` with type guards
- Small focused files (< 200 lines)
- Zod validation for runtime safety
- File headers explaining module purpose
- Colocated schemas (`*.schema.ts`)

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m 'Add my feature'`
4. Push to branch: `git push origin feature/my-feature`
5. Open Pull Request

### Development Guidelines

- Follow existing code style
- Add tests for new features
- Update documentation
- Keep files small and focused
- Use Zod for validation

## License

MIT © PagoPA

## Support

- **Issues**: [GitHub Issues](https://github.com/pagopa/opex-dashboard/issues)
- **Discussions**:
  [GitHub Discussions](https://github.com/pagopa/opex-dashboard/discussions)

---

Built with ❤️ by PagoPA team
