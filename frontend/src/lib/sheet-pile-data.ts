export interface SheetPile {
    id: string;
    model: string;
    series: string;
    width: number; // mm
    height: number; // mm
    thickness: number; // mm
    weight: number; // kg/m
    moment: number; // cm3/m
}

export const sheetPiles: SheetPile[] = [
    // L5-UM (Russian standard)
    { id: "l5-um", model: "Л5-УМ", series: "RU", width: 500, height: 236, thickness: 11, weight: 113, moment: 2962 },

    // Larson AZ Series
    { id: "az-13-770", model: "AZ 13-770", series: "AZ", width: 770, height: 344, thickness: 8.5, weight: 76.4, moment: 1300 },
    { id: "az-18-700", model: "AZ 18-700", series: "AZ", width: 700, height: 420, thickness: 9.5, weight: 81.6, moment: 1800 },
    { id: "az-26-700", model: "AZ 26-700", series: "AZ", width: 700, height: 460, thickness: 12.2, weight: 96.9, moment: 2600 },

    // AU Series
    { id: "au-14", model: "AU 14", series: "AU", width: 750, height: 408, thickness: 10, weight: 77.7, moment: 1405 },
    { id: "au-18", model: "AU 18", series: "AU", width: 750, height: 441, thickness: 10.5, weight: 88.5, moment: 1800 },
    { id: "au-25", model: "AU 25", series: "AU", width: 750, height: 485, thickness: 12, weight: 110.4, moment: 2500 },

    // VL Series
    { id: "vl-603", model: "VL 603", series: "VL", width: 600, height: 310, thickness: 9, weight: 73.6, moment: 1200 },
    { id: "vl-606a", model: "VL 606A", series: "VL", width: 600, height: 435, thickness: 9, weight: 86.1, moment: 2250 },

    // GU Series
    { id: "gu-16n", model: "GU 16N", series: "GU", width: 600, height: 430, thickness: 10.2, weight: 84.8, moment: 1600 },
    { id: "gu-22n", model: "GU 22N", series: "GU", width: 600, height: 450, thickness: 11.1, weight: 86.1, moment: 2200 },
];

export const sheetPileSeries = [
    { id: "all", label: "Все" },
    { id: "RU", label: "Л5-УМ (РФ)" },
    { id: "AZ", label: "Larssen AZ" },
    { id: "AU", label: "Arcelor AU" },
    { id: "VL", label: "VL Series" },
    { id: "GU", label: "GU Series" },
];
