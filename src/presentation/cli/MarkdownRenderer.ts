import { marked } from 'marked';
import { highlight } from 'cli-highlight';
import chalk from 'chalk';

/**
 * Parses markdown from the LLM and applies terminal-friendly syntax highlighting.
 */
export function renderMarkdown(text: string): string {
  // marked.parse returns HTML string by default. We want to convert code blocks to terminal colors.
  // A simple and lightweight approach for terminal markdown without full HTML parsing:
  
  let formatted = text;

  // Highlight inline code
  formatted = formatted.replace(/`([^`]+)`/g, chalk.cyan('$1'));

  // Highlight bold text
  formatted = formatted.replace(/\*\*([^*]+)\*\*/g, chalk.bold('$1'));

  // Highlight code blocks with cli-highlight
  formatted = formatted.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    try {
      const highlighted = highlight(code.trim(), { language: lang || 'typescript', ignoreIllegals: true });
      return `\n${chalk.bgGray.black(' ' + (lang || 'code').toUpperCase() + ' ')}\n${highlighted}\n`;
    } catch (e) {
      return `\n${chalk.gray(code.trim())}\n`;
    }
  });

  return formatted;
}
