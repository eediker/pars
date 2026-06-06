#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import gradient from 'gradient-string';
import ora from 'ora';

// Infrastructure
import { LocalFileSystem } from './infrastructure/fs/LocalFileSystem';
import { JsonConfigStore } from './infrastructure/store/JsonConfigStore';
import { FileContextManager } from './infrastructure/store/FileContextManager';
import { NodeWorkspaceScanner } from './infrastructure/fs/NodeWorkspaceScanner';
import { OpenAIProvider } from './infrastructure/llm/OpenAIProvider';
import { GeminiProvider } from './infrastructure/llm/GeminiProvider';
import { GroqProvider } from './infrastructure/llm/GroqProvider';
import { LLMProvider } from './core/ports/LLMProvider';

// Use Cases
import { AskUseCase } from './app/usecases/AskUseCase';
import { ReadUseCase } from './app/usecases/ReadUseCase';
import { RefactorUseCase } from './app/usecases/RefactorUseCase';
import { ConfigUseCase } from './app/usecases/ConfigUseCase';
import { ChatUseCase } from './app/usecases/ChatUseCase';
import { renderMarkdown } from './presentation/cli/MarkdownRenderer';
import * as p from '@clack/prompts';

const program = new Command();

// Pars aesthetic: Cyber-shamanism
const parsGradient = gradient(['#00ffcc', '#0099ff', '#9900ff']);
const title = `
    ██▓███   ▄▄▄       ██▀███   ██████ 
   ▓██░  ██▒▒████▄    ▓██ ▒ ██▒▒██    ▒ 
   ▓██░ ██▓▒▒██  ▀█▄  ▓██ ░▄█ ▒░ ▓██▄   
   ▒██▄█▓▒ ▒░██▄▄▄▄██ ▒██▀▀█▄    ▒   ██▒
   ▒██▒ ░  ░ ▓█   ▓██▒░██▓ ▒██▒▒██████▒▒
   ▒▓▒░ ░  ░ ▒▒   ▓▒█░░ ▒▓ ░▒▓░▒ ▒▓▒ ▒ ░
`;

// Initialize Dependencies
const fs = new LocalFileSystem();
const scanner = new NodeWorkspaceScanner();
const configStore = new JsonConfigStore();
const contextManager = new FileContextManager(fs);
const configUseCase = new ConfigUseCase(configStore);

async function getLLMProvider(): Promise<LLMProvider> {
  const activeProvider = await configUseCase.getActiveProvider();
  const apiKey = await configUseCase.getApiKey(activeProvider);
  
  if (!apiKey) {
    console.error(chalk.red(`\n[!] Pars cannot channel the spirits. No API Key found for ${activeProvider.toUpperCase()}.`));
    console.log(chalk.yellow(`Run: pars config ${activeProvider} <your-api-key>\n`));
    process.exit(1);
  }

  if (activeProvider === 'openai') {
    return new OpenAIProvider(apiKey);
  } else if (activeProvider === 'groq') {
    return new GroqProvider(apiKey);
  } else {
    return new GeminiProvider(apiKey);
  }
}

program
  .name('pars')
  .description(parsGradient(title) + '\nHyper-fast AI coding assistant.')
  .version('1.0.0');

program
  .command('ask <query>')
  .description('Context-free query to the LLM.')
  .action(async (query) => {
    const llm = await getLLMProvider();
    const askUseCase = new AskUseCase(llm, contextManager, fs, scanner);
    
    const spinner = ora({
      text: chalk.cyan(`[Pars] Consulting the spirits for: "${query}"...`),
      spinner: 'moon'
    }).start();

    try {
      const response = await askUseCase.execute(query);
      spinner.succeed(chalk.green('Revelation received:'));
      console.log(`\n${response}\n`);
    } catch (error: any) {
      spinner.fail(chalk.red(`The ritual failed: ${error.message}`));
    }
  });

program
  .command('read <file>')
  .description('Ingest a file/directory into the session memory context.')
  .action(async (file) => {
    const readUseCase = new ReadUseCase(fs, contextManager);
    const spinner = ora({
      text: chalk.cyan(`[Pars] Ingesting knowledge from: ${file}...`),
      spinner: 'moon'
    }).start();

    try {
      await readUseCase.execute(file);
      spinner.succeed(chalk.green(`Knowledge from ${file} absorbed into context.`));
    } catch (error: any) {
      spinner.fail(chalk.red(`Failed to ingest: ${error.message}`));
    }
  });

program
  .command('refactor <file>')
  .description('Propose code improvements and output a clean diff.')
  .option('-i, --instructions <text>', 'Specific refactoring instructions', 'Refactor for performance, readability, and clean architecture.')
  .action(async (file, options) => {
    const llm = await getLLMProvider();
    const refactorUseCase = new RefactorUseCase(llm, fs);
    
    const spinner = ora({
      text: chalk.cyan(`[Pars] Analyzing ${file} for ascension...`),
      spinner: 'moon'
    }).start();

    try {
      await refactorUseCase.execute(file, options.instructions);
      spinner.succeed(chalk.green(`Ascension complete. ${file} has been refactored in-place.`));
    } catch (error: any) {
      spinner.fail(chalk.red(`Ascension failed: ${error.message}`));
    }
  });

program
  .command('chat')
  .description('Enter interactive chat mode.')
  .action(async () => {
    const llm = await getLLMProvider();
    const chatUseCase = new ChatUseCase(llm, contextManager, fs, scanner);

    p.intro(parsGradient('Pars Interactive Mode Initialized'));

    while (true) {
      const query = await p.text({
        message: chalk.cyan('You:'),
        placeholder: 'Ask a question or type "exit" to leave...',
      });

      if (p.isCancel(query) || query === 'exit' || query === 'quit') {
        p.outro(chalk.magenta('The ritual has ended. Farewell.'));
        process.exit(0);
      }

      const spinner = p.spinner();
      spinner.start(chalk.magenta('Pars is channeling the spirits...'));

      try {
        const { response, modifiedFiles } = await chatUseCase.execute(query as string, (actionMsg) => {
          spinner.message(chalk.magenta(`Pars is acting autonomously... [${actionMsg}]`));
        });
        spinner.stop(chalk.green('Pars:'));
        console.log(`\n${renderMarkdown(response)}\n`);

        if (modifiedFiles.length > 0) {
          console.log(chalk.yellowBright(`[Notice] The spirits have altered the following files:`));
          modifiedFiles.forEach(file => console.log(chalk.yellowBright(`  - ${file}`)));
          console.log();
        }
      } catch (error: any) {
        spinner.stop(chalk.red('Ritual failed.'));
        p.log.error(error.message);
      }
    }
  });

program
  .command('config <provider> <apikey>')
  .description('Securely store your API key (provider: "gemini", "openai", or "groq").')
  .action(async (provider, apikey) => {
    if (provider !== 'gemini' && provider !== 'openai' && provider !== 'groq') {
      console.error(chalk.red('Invalid provider. Choose "gemini", "openai", or "groq".'));
      process.exit(1);
    }
    const spinner = ora({
      text: chalk.cyan(`[Pars] Binding ${provider.toUpperCase()} API Key to the sacred config...`),
      spinner: 'moon'
    }).start();

    try {
      await configUseCase.setApiKey(provider, apikey);
      spinner.succeed(chalk.green(`${provider.toUpperCase()} API Key bound securely. Pars is ready.`));
    } catch (error: any) {
      spinner.fail(chalk.red(`Failed to bind key: ${error.message}`));
    }
  });

program.parse();
