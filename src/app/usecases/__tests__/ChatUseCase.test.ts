import { ChatUseCase } from '../ChatUseCase';
import { LLMProvider } from '../../../core/ports/LLMProvider';
import { ContextManager } from '../../../core/ports/ContextManager';
import { FileSystem } from '../../../core/ports/FileSystem';
import { WorkspaceScanner } from '../../../core/ports/WorkspaceScanner';

// Mock dependencies
const mockLLM: jest.Mocked<LLMProvider> = {
  ask: jest.fn(),
  refactor: jest.fn(),
};

const mockContextManager: jest.Mocked<ContextManager> = {
  ingestContext: jest.fn(),
  retrieveContext: jest.fn(),
  clearContext: jest.fn(),
};

const mockFS: jest.Mocked<FileSystem> = {
  readFile: jest.fn(),
  writeFile: jest.fn(),
  listDirectory: jest.fn(),
  fileExists: jest.fn(),
};

const mockScanner: jest.Mocked<WorkspaceScanner> = {
  scan: jest.fn(),
};

describe('ChatUseCase', () => {
  let chatUseCase: ChatUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    chatUseCase = new ChatUseCase(mockLLM, mockContextManager, mockFS, mockScanner);

    mockContextManager.retrieveContext.mockResolvedValue('Mock Context');
    mockScanner.scan.mockResolvedValue({
      tree: 'Mock Tree',
      dependencies: ['react', 'jest'],
      description: 'Mock Project',
    });
  });

  it('should return a final response without any action tags', async () => {
    mockLLM.ask.mockResolvedValueOnce('<THOUGHT>Thinking</THOUGHT>Final Answer');

    const result = await chatUseCase.execute('Hello Pars');

    expect(result.response).toBe('Final Answer');
    expect(result.modifiedFiles).toEqual([]);
    expect(mockContextManager.retrieveContext).toHaveBeenCalled();
    expect(mockScanner.scan).toHaveBeenCalledWith(process.cwd());
    expect(mockLLM.ask).toHaveBeenCalledTimes(1);
  });

  it('should handle <READ> action', async () => {
    mockLLM.ask
      .mockResolvedValueOnce('<READ>test.txt</READ>')
      .mockResolvedValueOnce('Read Complete');
    mockFS.readFile.mockResolvedValueOnce('File Content');

    const onAction = jest.fn();
    const result = await chatUseCase.execute('Read file', onAction);

    expect(result.response).toBe('Read Complete');
    expect(mockFS.readFile).toHaveBeenCalledWith('test.txt');
    expect(onAction).toHaveBeenCalledWith('Reading test.txt...');
    expect(mockLLM.ask).toHaveBeenCalledTimes(2);
  });

  it('should handle <WRITE> action', async () => {
    mockLLM.ask
      .mockResolvedValueOnce('<WRITE path="out.txt">New Data</WRITE>')
      .mockResolvedValueOnce('Write Complete');
    mockFS.writeFile.mockResolvedValueOnce();

    const onAction = jest.fn();
    const result = await chatUseCase.execute('Write file', onAction);

    expect(result.response).toBe('Write Complete');
    expect(result.modifiedFiles).toContain('out.txt');
    expect(mockFS.writeFile).toHaveBeenCalledWith('out.txt', 'New Data');
    expect(onAction).toHaveBeenCalledWith('Rewriting out.txt...');
    expect(mockLLM.ask).toHaveBeenCalledTimes(2);
  });

  it('should handle <BASH> action', async () => {
    mockLLM.ask
      .mockResolvedValueOnce('<BASH>echo hello</BASH>')
      .mockResolvedValueOnce('Bash Complete');

    // Because execAsync is a module-level mock inside ChatUseCase, it actually calls the real one in testing unless we mock child_process.exec.
    // Instead of mocking child_process for this simple test, we allow echo hello to just run since it's harmless and very fast.

    const onAction = jest.fn();
    const result = await chatUseCase.execute('Run command', onAction);

    expect(result.response).toBe('Bash Complete');
    expect(onAction).toHaveBeenCalledWith('Executing bash command: echo hello');
    expect(mockLLM.ask).toHaveBeenCalledTimes(2);
  });

  it('should safeguard against infinite loops', async () => {
    mockLLM.ask.mockResolvedValue('<READ>test.txt</READ>');
    mockFS.readFile.mockResolvedValue('Content');

    const result = await chatUseCase.execute('Infinite loop test');

    expect(result.response).toContain('System Error: The agentic ritual was forcefully terminated');
    // Loop should break after MAX_ITERATIONS (7), but actually it continues up to iterationCount > 7, so it runs 7 times, then 8th time breaks.
    // 1st iteration: ask returns <READ>, iteration continues
    // ...
    // 7th iteration: ask returns <READ>, iteration continues
    // 8th iteration: count > 7, breaks.
    // So ask is called 7 times.
    expect(mockLLM.ask).toHaveBeenCalledTimes(7);
  });
});
