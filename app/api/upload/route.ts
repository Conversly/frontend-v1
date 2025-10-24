import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');

  if (!filename) {
    return NextResponse.json({ error: 'Missing filename' }, { status: 400 });
  }

  const blob = await put(filename, await request.arrayBuffer(), {
    access: 'public',
    addRandomSuffix: true,
  });

  return NextResponse.json(blob);
}
