import { spawnSync } from 'node:child_process';

const DEFAULT_PORT = 3000;
const dryRun = process.argv.includes('--dry-run');
const portArg = process.argv.slice(2).find((arg) => !arg.startsWith('-'));
const port = Number(process.env.API_PORT ?? portArg ?? DEFAULT_PORT);

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  if (result.error && !options.allowFailure) {
    throw result.error;
  }
  if (result.status !== 0 && !options.allowFailure) {
    throw new Error(result.stderr || `${command} exited with status ${result.status}`);
  }

  return (result.stdout ?? '').trim();
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function windowsListeners(targetPort) {
  const script = [
    '$ErrorActionPreference = "SilentlyContinue"',
    `$connections = @(Get-NetTCPConnection -LocalPort ${targetPort} -State Listen)`,
    'if ($connections.Count -eq 0) { exit 0 }',
    '$connections | Select-Object -ExpandProperty OwningProcess -Unique',
  ].join('; ');
  const output = run('powershell.exe', ['-NoProfile', '-Command', script], { allowFailure: true });
  const pids = unique(output.split(/\s+/).map((value) => Number(value)).filter(Number.isInteger));
  if (pids.length > 0) return pids;

  const netstat = run('netstat.exe', ['-ano', '-p', 'TCP'], { allowFailure: true });
  return unique(
    netstat
      .split(/\r?\n/)
      .map((line) => line.trim().split(/\s+/))
      .filter((parts) => parts[0] === 'TCP' && parts[3] === 'LISTENING' && parts[1]?.endsWith(`:${targetPort}`))
      .map((parts) => Number(parts[4]))
      .filter(Number.isInteger),
  );
}

function unixListeners(targetPort) {
  try {
    const output = run('lsof', ['-ti', `tcp:${targetPort}`, '-sTCP:LISTEN']);
    return unique(output.split(/\s+/).map((value) => Number(value)).filter(Number.isInteger));
  } catch {
    return [];
  }
}

function listeners(targetPort) {
  try {
    return process.platform === 'win32' ? windowsListeners(targetPort) : unixListeners(targetPort);
  } catch (error) {
    console.warn(
      `[free-api-port] Could not inspect port ${targetPort}: ${
        error instanceof Error ? error.message : 'unknown error'
      }`,
    );
    return [];
  }
}

function killProcessTree(pid) {
  if (dryRun) {
    console.log(`[free-api-port] Would stop process ${pid} on port ${port}.`);
    return;
  }

  if (process.platform === 'win32') {
    run('taskkill.exe', ['/PID', String(pid), '/T', '/F'], { allowFailure: true });
    return;
  }

  try {
    process.kill(pid, 'SIGTERM');
  } catch {
    return;
  }
}

if (!Number.isInteger(port) || port <= 0) {
  console.error(`[free-api-port] Invalid API_PORT value: ${process.env.API_PORT}`);
  process.exit(1);
}

const pids = listeners(port).filter((pid) => pid !== process.pid);

if (pids.length === 0) {
  console.log(`[free-api-port] Port ${port} is free.`);
  process.exit(0);
}

for (const pid of pids) {
  console.log(`[free-api-port] Port ${port} is in use by PID ${pid}.`);
  killProcessTree(pid);
}

if (!dryRun) {
  console.log(`[free-api-port] Freed port ${port}.`);
}
