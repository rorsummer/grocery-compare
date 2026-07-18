import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET() {
  const results: Record<string, unknown> = {};

  // 1. Check if curl is available
  try {
    const { stdout } = await execAsync('curl --version 2>&1', { timeout: 5000 });
    results.curlVersion = (stdout || '').split('\n')[0].slice(0, 80);
  } catch (e) {
    results.curlError = e instanceof Error ? e.message : String(e);
  }

  // 2. Check which curl binary
  try {
    const { stdout } = await execAsync('which curl 2>&1 || where curl 2>&1 || type curl 2>&1', { timeout: 5000 });
    results.curlPath = stdout.trim();
  } catch (e) {
    results.curlPathError = e instanceof Error ? e.message : String(e);
  }

  // 3. Try curl to PaknSave homepage
  const UA =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36';
  try {
    const cmd =
      `curl -s -D - -o /dev/null --max-time 15 ` +
      `-H "User-Agent: ${UA}" ` +
      `-H "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8" ` +
      `-H "Accept-Language: en-NZ,en;q=0.9" ` +
      `"https://www.paknsave.co.nz/"`;
    const { stdout } = await execAsync(cmd, { timeout: 20000 });
    results.pnsHeaders = stdout.slice(0, 600);
    const tokenMatch = stdout.match(/set-cookie:\s*fs-user-token=([^;]+)/i);
    results.pnsHasToken = !!tokenMatch;
  } catch (e) {
    results.pnsCurlError = e instanceof Error ? e.message : String(e);
  }

  // 4. Check Node.js version and platform
  results.nodeVersion = process.version;
  results.platform = process.platform;
  results.cwd = process.cwd();

  return NextResponse.json(results);
}
