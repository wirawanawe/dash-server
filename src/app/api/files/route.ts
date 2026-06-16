import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    let targetPath = searchParams.get('path') || '/'; // Default to root or user home? Default to root for aaPanel style

    // Ensure path is absolute (basic safety, though server-side we have full access anyway)
    if (!path.isAbsolute(targetPath)) {
      targetPath = path.resolve('/', targetPath);
    }

    const stat = await fs.stat(targetPath);

    if (stat.isDirectory()) {
      const items = await fs.readdir(targetPath, { withFileTypes: true });
      
      const files = items.map(item => ({
        name: item.name,
        isDirectory: item.isDirectory(),
        path: path.join(targetPath, item.name),
        // We'll fetch stats later if needed, but for large dirs it's slow. We can just return names for now.
      }));

      // Sort: Directories first, then files, both alphabetically
      files.sort((a, b) => {
        if (a.isDirectory === b.isDirectory) {
          return a.name.localeCompare(b.name);
        }
        return a.isDirectory ? -1 : 1;
      });

      return NextResponse.json({
        type: 'directory',
        path: targetPath,
        files
      });
    } else if (stat.isFile()) {
      // Check file size, don't read if too large (e.g. > 5MB)
      if (stat.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: "File is too large to view in browser." }, { status: 400 });
      }
      const content = await fs.readFile(targetPath, 'utf-8');
      return NextResponse.json({
        type: 'file',
        path: targetPath,
        content
      });
    }

    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  } catch (error: any) {
    console.error("File API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to access path" }, { status: 500 });
  }
}
