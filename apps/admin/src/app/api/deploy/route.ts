import { NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/session';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: Request) {
  const adminAuth = verifyAdminRequest(request);
  if (!adminAuth.isAuthorized) {
    return NextResponse.json({ success: false, error: 'Unauthorized: Admin authentication required' }, { status: 401 });
  }

  try {
    // 1. Run git pull inside /root/zeedo on host or container volume
    const pullResult = await execAsync('git pull origin master || git pull origin main', {
      cwd: process.cwd(),
      timeout: 20000,
    });

    return NextResponse.json({
      success: true,
      message: 'Fast deploy executed successfully',
      output: pullResult.stdout || pullResult.stderr,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err?.message || 'Deployment execution failed',
      stdout: err?.stdout,
      stderr: err?.stderr,
    }, { status: 500 });
  }
}
