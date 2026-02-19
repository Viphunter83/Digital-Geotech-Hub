/**
 * Universal Directus CMS data fetcher with fallback support.
 *
 * Pattern: fetchFromDirectus<T>(collection, options) → T[]
 * - ISR revalidation (60 sec default)
 * - Automatic fallback to empty array on error
 * - Console warning on fallback (for debugging)
 * - Support for fields, filter, sort, limit, deep
 */

const IS_SERVER = typeof window === 'undefined';

// On Server (SSR/Docker): hit the container directly via internal network
// On Client (Browser): use the /directus proxy to avoid CORS/403 issues
const CMS_URL = IS_SERVER
    ? (process.env.DIRECTUS_URL_INTERNAL || 'http://geotech_cms:8055')
    : (process.env.NEXT_PUBLIC_CMS_URL || '/directus');

interface FetchOptions {
    fields?: string[];
    filter?: Record<string, any>;
    sort?: string[];
    limit?: number;
    deep?: Record<string, any>;
    revalidate?: number; // ISR revalidation in seconds (default: 60)
}

/**
 * Fetch a list of items from a Directus collection.
 *
 * @example
 * const articles = await fetchFromDirectus<Article>('articles', {
 *   fields: ['id', 'title', 'slug', 'category.name'],
 *   filter: { status: { _eq: 'published' } },
 *   sort: ['-date_published'],
 *   limit: 10,
 * });
 */
export async function fetchFromDirectus<T = any>(
    collection: string,
    options?: FetchOptions,
): Promise<T[]> {
    try {
        const params = new URLSearchParams();

        if (options?.fields) {
            params.set('fields', options.fields.join(','));
        }
        if (options?.sort) {
            params.set('sort', options.sort.join(','));
        }
        if (options?.limit) {
            params.set('limit', String(options.limit));
        }
        if (options?.filter) {
            params.set('filter', JSON.stringify(options.filter));
        }
        if (options?.deep) {
            params.set('deep', JSON.stringify(options.deep));
        }

        const url = `${CMS_URL}/items/${collection}?${params.toString()}`;

        const res = await fetch(url, {
            next: { revalidate: options?.revalidate ?? 60 },
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!res.ok) {
            throw new Error(`Directus responded with ${res.status} for ${collection}`);
        }

        const json = await res.json();
        return (json.data ?? []) as T[];
    } catch (err) {
        console.warn(`⚠️ Directus fallback for "${collection}":`, err instanceof Error ? err.message : err);
        return [];
    }
}

/**
 * Fetch a single item from a Directus collection by primary key.
 */
export async function fetchOneFromDirectus<T = any>(
    collection: string,
    id: string | number,
    options?: Pick<FetchOptions, 'fields' | 'deep' | 'revalidate'>,
): Promise<T | null> {
    try {
        const params = new URLSearchParams();
        if (options?.fields) {
            params.set('fields', options.fields.join(','));
        }
        if (options?.deep) {
            params.set('deep', JSON.stringify(options.deep));
        }

        const url = `${CMS_URL}/items/${collection}/${id}?${params.toString()}`;

        const res = await fetch(url, {
            next: { revalidate: options?.revalidate ?? 60 },
            headers: { 'Content-Type': 'application/json' },
        });

        if (!res.ok) {
            throw new Error(`Directus responded with ${res.status} for ${collection}/${id}`);
        }

        const json = await res.json();
        return (json.data ?? null) as T | null;
    } catch (err) {
        console.warn(`⚠️ Directus fallback for "${collection}/${id}":`, err instanceof Error ? err.message : err);
        return null;
    }
}

/**
 * Fetch a singleton (single-item collection) from Directus.
 * Used for collections like `company_info` that have only one record.
 */
export async function fetchSingleton<T = any>(
    collection: string,
    options?: Pick<FetchOptions, 'fields' | 'revalidate'>,
): Promise<T | null> {
    try {
        const params = new URLSearchParams();
        if (options?.fields) {
            params.set('fields', options.fields.join(','));
        }

        const url = `${CMS_URL}/items/${collection}?${params.toString()}`;

        const res = await fetch(url, {
            next: { revalidate: options?.revalidate ?? 60 },
            headers: { 'Content-Type': 'application/json' },
        });

        if (!res.ok) {
            throw new Error(`Directus responded with ${res.status} for singleton ${collection}`);
        }

        const json = await res.json();
        return (json.data ?? null) as T | null;
    } catch (err) {
        console.warn(`⚠️ Directus fallback for singleton "${collection}":`, err instanceof Error ? err.message : err);
        return null;
    }
}

/**
 * Build a Directus file URL from a file ID or filename.
 * Used to display images uploaded through Directus File Library.
 */
export function getDirectusFileUrl(fileId: string | null | undefined): string | null {
    if (!fileId) return null;
    return `${CMS_URL}/assets/${fileId}`;
}
