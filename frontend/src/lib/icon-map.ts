/**
 * Icon mapping from Directus string names to Lucide React components.
 *
 * In Directus, icons are stored as simple lowercase strings (e.g., "drill", "hammer").
 * This module maps them to actual React components for rendering.
 *
 * When adding a new icon to Directus dropdowns, add the mapping here as well.
 */

import {
    Drill, Layers, Anchor, Hammer, ArrowDownCircle,
    Activity, Shield, Construction, MoveVertical, Zap,
    Pickaxe, Component, Tractor, Settings,
    Clock, Award, Wrench, ShieldCheck,
    Cpu, Target, Users, Globe,
    Weight, Ruler, Box, Database, Cloud, FileText,
    type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
    drill: Drill,
    layers: Layers,
    anchor: Anchor,
    hammer: Hammer,
    "arrow-down-circle": ArrowDownCircle,
    activity: Activity,
    shield: Shield,
    construction: Construction,
    "move-vertical": MoveVertical,
    zap: Zap,
    pickaxe: Pickaxe,
    component: Component,
    tractor: Tractor,
    settings: Settings,
    clock: Clock,
    award: Award,
    wrench: Wrench,
    "shield-check": ShieldCheck,
    cpu: Cpu,
    target: Target,
    users: Users,
    globe: Globe,
    weight: Weight,
    ruler: Ruler,
    box: Box,
    database: Database,
    cloud: Cloud,
    "file-text": FileText,
};

/**
 * Resolve an icon name (from Directus) to a Lucide React component.
 * Falls back to `Box` if the name is unknown.
 */
export function resolveIcon(name: string | null | undefined): LucideIcon {
    if (!name) return Box;
    return iconMap[name.toLowerCase()] ?? Box;
}

/**
 * List of available icon names — useful for Directus dropdown configuration.
 */
export const AVAILABLE_ICONS = Object.keys(iconMap);
