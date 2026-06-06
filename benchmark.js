const { FileContextManager } = require('./dist/infrastructure/store/FileContextManager.js');

class MockFS {
  constructor() {
    this.files = {};
  }
  async fileExists(path) {
    return this.files[path] !== undefined;
  }
  async readFile(path) {
    return this.files[path];
  }
  async writeFile(path, data) {
    this.files[path] = data;
  }
}

async function run() {
  const fs = new MockFS();
  const manager = new FileContextManager(fs);

  const start = process.hrtime.bigint();

  for (let i = 0; i < 10000; i++) {
    await manager.ingestContext('file' + i, 'content ' + i);
    await manager.retrieveContext();
  }

  const end = process.hrtime.bigint();
  const ms = Number(end - start) / 1000000;

  console.log(`Time taken: ${ms.toFixed(2)} ms`);
}

run().catch(console.error);
