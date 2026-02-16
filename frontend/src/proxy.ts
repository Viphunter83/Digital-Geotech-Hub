import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const geoQuery = searchParams.get('geo');

    const response = NextResponse.next();

    // Имитация GEO-детекции: если в URL есть ?geo=..., запоминаем в куки
    if (geoQuery === 'msk' || geoQuery === 'spb') {
        response.cookies.set('x-geo-region', geoQuery, { path: '/' });
    } else {
        // Дефолтное значение, если кука еще не установлена
        const existingGeo = request.cookies.get('x-geo-region')?.value;
        if (!existingGeo) {
            response.cookies.set('x-geo-region', 'spb', { path: '/' });
        }
    }

    return response;
}

export const config = {
    matcher: ['/', '/services/:path*'],
};
