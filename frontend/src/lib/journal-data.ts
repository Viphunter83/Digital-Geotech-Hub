import { fetchFromDirectus, getDirectusFileUrl } from './directus-fetch';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface Article {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    category: string;
    date: string;
    readTime: string;
    author: string;
    image: string;
    seo?: {
        title: string;
        description: string;
    };
}

/** Raw shape coming from Directus */
interface DirectusArticle {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    category: { name: string } | null;
    date_published: string;
    read_time: string;
    author: string;
    image: string | null;
    seo_title: string | null;
    seo_description: string | null;
}

// ──────────────────────────────────────────────
// Directus → Frontend transformer
// ──────────────────────────────────────────────

function transformArticle(d: DirectusArticle): Article {
    // Variety for placeholder images if not set in CMS
    const placeholders = [
        '/assets/journal-ai.png',
        '/assets/journal-geology.png',
        '/assets/static_piling_expert.png'
    ];
    const fallbackImage = placeholders[d.id % placeholders.length];

    return {
        id: String(d.id),
        title: d.title,
        slug: d.slug,
        excerpt: d.excerpt,
        content: d.content,
        category: d.category?.name ?? 'Без категории',
        date: d.date_published
            ? new Date(d.date_published).toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            })
            : '',
        readTime: d.read_time ?? '',
        author: d.author ?? '',
        image: getDirectusFileUrl(d.image) ?? fallbackImage,
        seo: d.seo_title
            ? { title: d.seo_title, description: d.seo_description ?? '' }
            : undefined,
    };
}

// ──────────────────────────────────────────────
// Fetch from Directus (with fallback)
// ──────────────────────────────────────────────

/**
 * Fetch all published articles from Directus, sorted by publication date.
 * Falls back to hardcoded ARTICLES_FALLBACK if Directus is unavailable.
 */
export async function fetchArticles(options?: { limit?: number; category?: string }): Promise<Article[]> {
    const filter: Record<string, any> = { status: { _eq: 'published' } };
    if (options?.category && options.category !== 'Все') {
        filter.category = { name: { _eq: options.category } };
    }

    const data = await fetchFromDirectus<DirectusArticle>('articles', {
        fields: [
            'id', 'title', 'slug', 'excerpt', 'content',
            'category.name', 'date_published', 'read_time',
            'author', 'image', 'seo_title', 'seo_description',
        ],
        filter,
        sort: ['-date_published'],
        limit: options?.limit,
    });

    if (data.length > 0) {
        return data.map(transformArticle);
    }

    // Fallback: apply client-side filtering
    let fallback = ARTICLES_FALLBACK;
    if (options?.category && options.category !== 'Все') {
        fallback = fallback.filter(a => a.category === options.category);
    }
    if (options?.limit) {
        fallback = fallback.slice(0, options.limit);
    }
    return fallback;
}

/**
 * Fetch a single article by slug from Directus.
 * Falls back to hardcoded data.
 */
export async function fetchArticleBySlug(slug: string): Promise<Article | null> {
    const data = await fetchFromDirectus<DirectusArticle>('articles', {
        fields: [
            'id', 'title', 'slug', 'excerpt', 'content',
            'category.name', 'date_published', 'read_time',
            'author', 'image', 'seo_title', 'seo_description',
        ],
        filter: {
            slug: { _eq: slug },
            status: { _eq: 'published' },
        },
        limit: 1,
    });

    if (data.length > 0) {
        return transformArticle(data[0]);
    }

    // Fallback
    return ARTICLES_FALLBACK.find(a => a.slug === slug) ?? null;
}

/**
 * Fetch article categories from Directus.
 * Falls back to hardcoded list.
 */
export async function fetchArticleCategories(): Promise<string[]> {
    const data = await fetchFromDirectus<{ name: string }>('article_categories', {
        fields: ['name'],
        sort: ['sort'],
    });

    if (data.length > 0) {
        return ['Все', ...data.map(c => c.name)];
    }

    return CATEGORIES_FALLBACK;
}

// ──────────────────────────────────────────────
// Fallback Data (current hardcoded content)
// ──────────────────────────────────────────────

export const CATEGORIES_FALLBACK = ["Все", "Технологии", "Инновации", "Геология", "Кейсы", "Оборудование"];

export const ARTICLES_FALLBACK: Article[] = [
    {
        id: "1",
        title: "Статическое вдавливание: как сохранить исторические здания при строительстве",
        excerpt: "Разбираем технологию Silent Piler и её применение в плотной застройке Санкт-Петербурга. Сравнение с вибропогружением.",
        content: `
            <h2>Введение в технологию</h2>
            <p>Статическое вдавливание шпунта — это уникальный метод устройства ограждений котлованов, который практически полностью исключает вибрационное воздействие на окружающий грунт и фундаменты соседних зданий. Это делает его незаменимым при работе в условиях плотной исторической застройки, такой как центр Санкт-Петербурга.</p>
            
            <h3>Преимущества перед вибропогружением</h3>
            <ul>
                <li><strong>Отсутствие вибрации:</strong> Безопасность для зданий-памятников.</li>
                <li><strong>Низкий уровень шума:</strong> Возможность работы в ночное время и в жилых кварталах.</li>
                <li><strong>Контроль усилия:</strong> Точное понимание несущей способности каждой сваи или шпунтины в реальном времени.</li>
            </ul>

            <blockquote>
                Технология Silent Piler позволяет погружать шпунт вплотную к существующим фундаментам (на расстоянии до 50 мм), что экономит до 20% полезной площади участка.
            </blockquote>

            <h3>Оборудование</h3>
            <p>Мы используем японские установки GIKEN серии F. Эти машины передвигаются по уже погруженному шпунту, используя его сопротивление для вдавливания следующего элемента. Такая "шагающая" система минимизирует площадь строительной площадки.</p>
        `,
        category: "Технологии",
        date: "12 Фев 2026",
        readTime: "8 мин",
        author: "Алексей Иванов",
        image: "/assets/static_piling_expert.png",
        slug: "static-pressing-foundation",
        seo: {
            title: "Статическое вдавливание шпунта в СПб | Технология Silent Piler",
            description: "Профессиональный разбор метода статического вдавливания шпунта. Преимущества для плотной застройки и обзор оборудования Giken."
        }
    },
    {
        id: "2",
        title: "AI в геотехнике: автоматизация аудита проектной документации",
        excerpt: "Как нейронные сети помогают находить ошибки в чертежах и оптимизировать сметы за считанные минуты.",
        content: `
            <h2>Новая эра проектирования</h2>
            <p>Цифровая трансформация в геотехническом строительстве больше не является будущим — это наше настоящее. В 2026 году AI-ассистенты стали стандартным инструментом для первичного анализа ПД и РД.</p>
            
            <h3>Как работает наш AI-Copilot</h3>
            <p>Наша система обучена на тысячах реализованных проектов и актуальных нормативных документах (ГОСТ, СНиП). При загрузке комплекта чертежей алгоритм:</p>
            <ol>
                <li>Сканирует геологические разрезы и извлекает физико-механические свойства грунтов.</li>
                <li>Проверяет соответствие выбранного метода погружения (шпунт, БНС) типу грунта.</li>
                <li>Подсвечивает аномалии в ведомостях объемов работ, предотвращая переплаты.</li>
            </ol>

            <p>Автоматизация позволяет сократить время на предварительный аудит с 3-х дней до 15 минут, сохраняя при этом точность инженерных расчетов.</p>
        `,
        category: "Инновации",
        date: "10 Фев 2026",
        readTime: "12 мин",
        author: "Smart Geotech AI",
        image: "/assets/journal-ai.png",
        slug: "ai-geotech-audit",
        seo: {
            title: "Искусственный интеллект в геотехническом строительстве 2026",
            description: "Как автоматизация и AI-аудит меняют рынок нулевого цикла. Оптимизация смет и поиск ошибок в документации."
        }
    },
    {
        id: "3",
        title: "Анализ грунтов Москвы: основные риски и типы фундаментов",
        excerpt: "Обзор геологических особенностей Московского региона. Карстовые воронки и методы их укрепления.",
        content: `
            <h2>Сложная геология Москвы</h2>
            <p>Москва характеризуется неоднородными геологическими условиями. Наличие древних русел рек, техногенных отложений и карстовых опасностей требует особого подхода к проектированию фундаментов.</p>
            
            <h3>Ключевые факторы риска</h3>
            <p>При строительстве в Москве инженеры чаще всего сталкиваются со следующими проблемами:</p>
            <ul>
                <li><strong>Карстово-суффозионные процессы:</strong> Риск образования пустот в известняках.</li>
                <li><strong>Водонасыщенные пески (плывуны):</strong> Трудности при разработке котлованов.</li>
                <li><strong>Влияние на линии метрополитена:</strong> Жесткие ограничения по осадкам в зонах влияния ГУП "Московский метрополитен".</li>
            </ul>

            <p>Для таких условий мы рекомендуем комбинацию буросекущих свай и многоуровневых распорных систем, обеспечивающих максимальную жесткость ограждения.</p>
        `,
        category: "Геология",
        date: "08 Фев 2026",
        readTime: "10 мин",
        author: "Дмитрий Петров",
        image: "/assets/journal-geology.png",
        slug: "moscow-soil-analysis",
        seo: {
            title: "Особенности грунтов Москвы для фундаментостроения | Геологический анализ",
            description: "Разбор геологических рисков Москвы. Карстовые опасности, плывуны и методы защиты котлованов в столичном регионе."
        }
    }
];

/**
 * @deprecated Use fetchArticles() instead. Kept for backward compatibility.
 */
export const ARTICLES = ARTICLES_FALLBACK;
