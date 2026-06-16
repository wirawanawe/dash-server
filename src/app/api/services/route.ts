import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import util from 'util';

export const dynamic = 'force-dynamic'; // disable caching

const execAsync = util.promisify(exec);

export async function GET() {
  try {
    // 1. Check MySQL Status
    let mysqlStatus = 'stopped';
    try {
      // systemctl is-active returns 'active' if running, or a non-zero exit code if not.
      const { stdout } = await execAsync('systemctl is-active mysql');
      mysqlStatus = stdout.trim();
    } catch (error: any) {
      // If it throws, it means it returned a non-zero exit code (e.g. 'inactive', 'failed', or command not found)
      // Since this is a dev environment on Mac, it might not exist.
      // For local development on mac, we fallback to 'inactive' or error state.
      mysqlStatus = error.stdout?.trim() || 'stopped';
      if (mysqlStatus === 'unknown' || mysqlStatus === '') {
        mysqlStatus = 'stopped'; // Assume stopped if unknown
      }
    }

    // 2. Check PM2 Status
    let pm2Apps = [];
    try {
      const { stdout } = await execAsync('pm2 jlist');
      const pm2List = JSON.parse(stdout);
      
      pm2Apps = pm2List.map((app: any) => ({
        id: app.pm_id,
        name: app.name,
        status: app.pm2_env.status, // e.g. 'online', 'stopped', 'errored'
        memory: app.monit ? app.monit.memory : 0, // bytes
        cpu: app.monit ? app.monit.cpu : 0, // percentage
        uptime: app.pm2_env.pm_uptime,
      }));
    } catch (error) {
      // If pm2 is not installed or errors out (e.g. local mac without pm2 running)
      // Return empty array or mock data for local UI development.
      console.warn("Failed to get PM2 list. Is PM2 installed globally?", error);
    }

    // Return the combined payload
    return NextResponse.json({
      mysql: {
        status: mysqlStatus,
      },
      pm2: pm2Apps,
    });
  } catch (error: any) {
    console.error("Error fetching service statuses:", error);
    return NextResponse.json({ error: "Failed to fetch service statuses" }, { status: 500 });
  }
}
