import { NextResponse } from 'next/server';
import si from 'systeminformation';

export const dynamic = 'force-dynamic'; // disable caching

export async function GET() {
  try {
    // We can fetch data concurrently to speed up the API
    const [cpuInfo, memInfo, fsSize] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.fsSize()
    ]);

    // Find the root filesystem to get primary storage stats
    const rootFs = fsSize.find(fs => fs.mount === '/');

    const metrics = {
      cpu: {
        loadPercentage: cpuInfo.currentLoad.toFixed(2),
        cores: cpuInfo.cpus.length,
      },
      ram: {
        total: memInfo.total,
        used: memInfo.used,
        free: memInfo.free,
        usedPercentage: ((memInfo.used / memInfo.total) * 100).toFixed(2),
      },
      disk: {
        total: rootFs?.size || 0,
        used: rootFs?.used || 0,
        usedPercentage: rootFs?.use || 0,
      }
    };

    return NextResponse.json(metrics);
  } catch (error: any) {
    console.error("Error fetching metrics:", error);
    return NextResponse.json({ error: "Failed to fetch hardware metrics" }, { status: 500 });
  }
}
