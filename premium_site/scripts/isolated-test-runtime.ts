import fs from 'fs';
import os from 'os';
import path from 'path';

/**
 * Put backend protocol suites in a clean sandbox before importing server
 * modules. This prevents tests from reading the developer's .env/runtime
 * wallet or accidentally targeting a running LIVE daemon.
 */
export function createIsolatedTestRuntime(prefix: string): () => void {
  const tempRoot = path.resolve(os.tmpdir());
  const runtimeDir = fs.mkdtempSync(path.join(tempRoot, prefix));
  const resolvedRuntimeDir = path.resolve(runtimeDir);
  if (path.dirname(resolvedRuntimeDir) !== tempRoot || !path.basename(resolvedRuntimeDir).startsWith(prefix)) {
    throw new Error('Isolated test directory escaped the system temporary directory.');
  }

  const envFile = path.join(resolvedRuntimeDir, 'empty.env');
  fs.writeFileSync(envFile, '', 'utf8');
  process.env.SYNAPSE_RUNTIME_DIR = resolvedRuntimeDir;
  process.env.SYNAPSE_ENV_FILE = envFile;
  process.env.SYNAPSE_SKIP_SERVER_START = 'true';
  process.env.SYNAPSE_ALLOW_PUBLIC_LIVE = 'false';
  process.env.TEMPO_RELAYER_KEY = '';
  process.env.PRIVATE_KEY = '';
  process.env.TEMPO_VAULT_OWNER_KEY = '';
  process.chdir(resolvedRuntimeDir);

  return () => {
    process.chdir(tempRoot);
    fs.rmSync(resolvedRuntimeDir, { recursive: true, force: true });
  };
}
