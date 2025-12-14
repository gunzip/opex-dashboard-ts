#!/usr/bin/env node
/**
 * CLI entry point for opex-dashboard.
 * Provides commands for generating operational dashboards from OpenAPI specs.
 */

import { Command } from "commander";

import { createGenerateCommand } from "./commands/generate.js";

const program = new Command();

program
  .name("opex_dashboard")
  .description("Generate operational dashboards from OpenAPI 3 specifications")
  .version("2.0.0");

// Register commands
program.addCommand(createGenerateCommand());

// Parse arguments
program.parse(process.argv);
