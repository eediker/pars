#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import gradient from 'gradient-string';

const program = new Command();

// Pars aesthetic: Cyber-shamanism
const parsGradient = gradient(['#00ffcc', '#0099ff', '#9900ff']);
const title = `
╔═══════════════════════════════════════╗
║                P A R S                ║
╚═══════════════════════════════════════╝
`;

program
  .name('pars')
  .description(parsGradient(title) + '\nHyper-fast AI coding assistant.')
  .version('1.0.0');

program
  .command('ask <query>')
  .description('Context-free query to the LLM.')
  .action(async (query) => {
    console.log(chalk.cyan(`[Pars] Consulting the spirits for: "${query}"...`));
    // TODO: Wire up app use case
  });

program
  .command('read <file>')
  .description('Ingest a file/directory into the session memory context.')
  .action(async (file) => {
    console.log(chalk.cyan(`[Pars] Ingesting knowledge from: ${file}...`));
    // TODO: Wire up app use case
  });

program
  .command('refactor <file>')
  .description('Propose code improvements and output a clean diff.')
  .action(async (file) => {
    console.log(chalk.cyan(`[Pars] Analyzing ${file} for ascension...`));
    // TODO: Wire up app use case
  });

program
  .command('config')
  .description('Securely store API keys and local LLM endpoints.')
  .action(async () => {
    console.log(chalk.cyan(`[Pars] Initiating configuration ritual...`));
    // TODO: Wire up app use case
  });

program.parse();
