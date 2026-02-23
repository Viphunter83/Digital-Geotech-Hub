import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function GET(request: NextRequest) {
    const secret = request.nextUrl.searchParams.get('secret');
    const path = request.nextUrl.searchParams.get('path') || '/';

    // Use environment variable or fallback to a default (should be changed for production)
    const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET || 'geotech_2025_sync';

    if (secret !== REVALIDATE_SECRET) {
        return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
    }

    try {
        revalidatePath(path);
        // Also revalidate portfolio specific pages if path is root
        if (path === '/') {
            revalidatePath('/portfolio');
            revalidatePath('/portfolio/[id]', 'page');
        }

        return NextResponse.json({
            revalidated: true,
            path,
            now: new Date().toISOString()
        });
    } catch (err) {
        return NextResponse.json({ message: 'Error revalidating', error: String(err) }, { status: 500 });
    }
}
