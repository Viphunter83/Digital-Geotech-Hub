import { fetchFromDirectus } from './directus-fetch';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface SheetPileSeries {
    id: string;
    label: string;
}

export interface SheetPile {
    id: string;
    model: string;
    series: string;
    width: number;
    height: number;
    thickness: number;
    weight: number;
    moment: number;
}

interface DirectusSheetPile {
    id: string;
    model: string;
    series: { id: string } | string | null;
    width: number;
    height: number;
    thickness: number;
    weight: number;
    moment: number;
}

// ──────────────────────────────────────────────
// Fetch from Directus
// ──────────────────────────────────────────────

/**
 * Fetch sheet pile profiles from Directus.
 */
export async function fetchSheetPiles(): Promise<SheetPile[]> {
    const data = await fetchFromDirectus<DirectusSheetPile>('sheet_piles', {
        fields: ['id', 'model', 'series.id', 'width', 'height', 'thickness', 'weight', 'moment'],
        sort: ['series.sort', 'model'],
    });

    if (data.length > 0) {
        return data.map(d => ({
            id: d.id,
            model: d.model,
            series: typeof d.series === 'object' && d.series ? d.series.id : (d.series ?? ''),
            width: d.width,
            height: d.height,
            thickness: d.thickness,
            weight: d.weight,
            moment: d.moment,
        }));
    }

    return SHEET_PILES_FALLBACK;
}

/**
 * Fetch sheet pile series names from Directus.
 */
export async function fetchSheetPileSeries(): Promise<SheetPileSeries[]> {
    const data = await fetchFromDirectus<{ id: string; name: string }>('sheet_pile_series', {
        fields: ['id', 'name'],
        sort: ['sort'],
    });

    if (data.length > 0) {
        return [
            { id: 'all', label: 'Все' },
            ...data.map(s => ({ id: s.id, label: s.name ?? s.id }))
        ];
    }

    return SHEET_PILE_SERIES_FALLBACK;
}

// ──────────────────────────────────────────────
// Fallback Data
// ──────────────────────────────────────────────

export const SHEET_PILE_SERIES_FALLBACK: SheetPileSeries[] = [
    { id: 'all', label: 'Все' },
    { id: 'AZ', label: 'AZ' },
    { id: 'AU', label: 'AU' },
    { id: 'PU', label: 'PU' },
];

export const SHEET_PILES_FALLBACK: SheetPile[] = [
    { id: "az-13-770", model: "AZ 13-770", series: "AZ", width: 770, height: 344, thickness: 8.5, weight: 76.4, moment: 1300 },
    { id: "az-18-800", model: "AZ 18-800", series: "AZ", width: 800, height: 380, thickness: 8.5, weight: 82.0, moment: 1800 },
    { id: "az-26-700", model: "AZ 26-700", series: "AZ", width: 700, height: 427, thickness: 12.2, weight: 112.0, moment: 2600 },
    { id: "az-36-700n", model: "AZ 36-700N", series: "AZ", width: 700, height: 479, thickness: 13.0, weight: 127.0, moment: 3600 },
    { id: "az-46-700n", model: "AZ 46-700N", series: "AZ", width: 700, height: 580, thickness: 13.0, weight: 145.0, moment: 4620 },
    { id: "au-14", model: "AU 14", series: "AU", width: 750, height: 408, thickness: 9.5, weight: 92.0, moment: 1400 },
    { id: "au-18", model: "AU 18", series: "AU", width: 750, height: 440, thickness: 11.2, weight: 105.0, moment: 1810 },
    { id: "au-21", model: "AU 21", series: "AU", width: 750, height: 450, thickness: 12.0, weight: 119.0, moment: 2100 },
    { id: "au-25", model: "AU 25", series: "AU", width: 750, height: 460, thickness: 14.0, weight: 130.0, moment: 2500 },
    { id: "pu-12", model: "PU 12", series: "PU", width: 600, height: 360, thickness: 9.8, weight: 70.0, moment: 1200 },
    { id: "pu-22", model: "PU 22", series: "PU", width: 600, height: 450, thickness: 10.0, weight: 102.0, moment: 2210 },
];

/**
 * @deprecated Use fetchSheetPiles() instead.
 */
export const sheetPiles = SHEET_PILES_FALLBACK;

/**
 * @deprecated Use fetchSheetPileSeries() instead.
 */
export const sheetPileSeries: SheetPileSeries[] = SHEET_PILE_SERIES_FALLBACK;
