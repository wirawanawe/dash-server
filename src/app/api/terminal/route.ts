import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import util from 'util';

export const dynamic = 'force-dynamic';

const execAsync = util.promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { command, cwd = process.cwd() } = body;

    if (!command) {
      return NextResponse.json({ error: "Command is required" }, { status: 400 });
    }

    try {
      const { stdout, stderr } = await execAsync(command, { cwd });
      return NextResponse.json({ stdout, stderr, cwd });
    } catch (execError: any) {
      // If a command fails (e.g. non-zero exit code), exec throws an error
      // that contains stdout and stderr.
      return NextResponse.json({ 
        stdout: execError.stdout || '', 
        stderr: execError.stderr || execError.message,
        cwd
      });
    }

  } catch (error: any) {
    console.error("Terminal API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
