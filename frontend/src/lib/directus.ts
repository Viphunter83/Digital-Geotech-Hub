import { createDirectus, rest, staticToken } from '@directus/sdk';

const url = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';
const token = process.env.DIRECTUS_ADMIN_TOKEN;

export const directus = createDirectus(url)
    .with(rest())
    .with(staticToken(token || ''));

// Types for Geotech Hub
export interface Machinery {
    id: number;
    name: string;
    type: string;
    status: string;
    technical_specs: unknown;
    category: number;
}

export interface Service {
    id: number;
    title: string;
    slug: string;
    description: string;
    machinery_category: number;
}
