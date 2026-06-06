import { isCommandSecure } from '../ChatUseCase';

describe('Command Security', () => {
  it('should allow whitelisted commands', () => {
    expect(isCommandSecure('npm install').secure).toBe(true);
    expect(isCommandSecure('jest --coverage').secure).toBe(true);
    expect(isCommandSecure('ls -la').secure).toBe(true);
  });

  it('should block non-whitelisted commands', () => {
    const res = isCommandSecure('python malicious.py');
    expect(res.secure).toBe(false);
    expect(res.reason).toContain('not allowed');
  });

  it('should block dangerous shell characters', () => {
    const chars = ['&', '|', ';', '`', '<', '>', '$'];
    for (const char of chars) {
      const res = isCommandSecure(`echo hello ${char} something`);
      expect(res.secure).toBe(false);
      expect(res.reason).toContain('forbidden shell characters');
    }
  });

  it('should block newlines that can bypass checks', () => {
    expect(isCommandSecure('ls\nrm -rf /').secure).toBe(false);
    expect(isCommandSecure('ls\r\nrm -rf /').secure).toBe(false);
  });

  it('should block node -e variants', () => {
    expect(isCommandSecure('node -e "console.log(1)"').secure).toBe(false);
    expect(isCommandSecure('node --eval "console.log(1)"').secure).toBe(false);
    expect(isCommandSecure('node script.js').secure).toBe(true);
  });
});
