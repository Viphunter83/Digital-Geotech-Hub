
export interface Project {
    id: string;
    title: string;
    location: string;
    region: 'spb' | 'msk' | 'regions';
    category: 'industrial' | 'civil' | 'infrastructure' | 'marine';
    description: string;
    challenge: string;
    solution: string;
    year: string;
    latitude: number;
    longitude: number;
    image: string;
    tags: string[];
    stats: {
        label: string;
        value: string;
    }[];
}

export const PROJECTS: Project[] = [
    {
        id: 'lakhta-2',
        title: 'МФК «Лахта Центр 2»',
        location: 'Санкт-Петербург',
        region: 'spb',
        category: 'civil',
        description: 'Устройство шпунтового ограждения котлована для второго небоскреба в условиях плотной застройки и сложных грунтов.',
        challenge: 'Нулевые допуски по вибрации из-за близости существующей башни и исторических зданий.',
        solution: 'Использование технологии статического вдавливания Giken Silent Piler. Погружение шпунта длиной 24 метра без резонансных колебаний.',
        year: '2024',
        latitude: 59.98,
        longitude: 30.17,
        image: '/assets/projects/lakhta.png',
        tags: ['Giken Silent Piler', 'Шпунт Ларсена', 'Нулевой цикл'],
        stats: [
            { label: 'Глубина', value: '24 м' },
            { label: 'Шпунт', value: '1,200 т' },
            { label: 'Срок', value: '3 мес' }
        ]
    },
    {
        id: 'moscow-city',
        title: 'ЖК «High Life» (Москва-Сити)',
        location: 'Москва',
        region: 'msk',
        category: 'civil',
        description: 'Комплекс работ по устройству «стены в грунте» и буросекущих свай для многоуровневого подземного паркинга.',
        challenge: 'Стесненные условия мегаполиса, необходимость работы в режиме 24/7 для соблюдения жесткого графика.',
        solution: 'Мобилизация двух установок Bauer BG. Устройство свайного поля диаметром 800мм в рекордные сроки.',
        year: '2023',
        latitude: 55.75,
        longitude: 37.54,
        image: '/assets/projects/moscow-city.png',
        tags: ['Bauer BG', 'Буросекущие сваи', 'Котлован'],
        stats: [
            { label: 'Сваи', value: '450 шт' },
            { label: 'Диаметр', value: '800 мм' },
            { label: 'Бетон', value: '15,000 м³' }
        ]
    },
    {
        id: 'ust-luga',
        title: 'Терминал СПГ «Усть-Луга»',
        location: 'Ленинградская обл.',
        region: 'regions',
        category: 'marine',
        description: 'Берегоукрепление и устройство причальной стенки для нового терминала сжиженного газа.',
        challenge: 'Работа в прибрежной зоне, сложные гидрогеологические условия, высокие ветровые нагрузки.',
        solution: 'Вибропогружение трубчатого шпунта большого диаметра с использованием тяжелых вибропогружателей PVE.',
        year: '2023',
        latitude: 59.68,
        longitude: 28.42,
        image: '/assets/projects/ust-luga.png',
        tags: ['Трубчатый шпунт', 'Вибропогружение', 'Гидротехника'],
        stats: [
            { label: 'Шпунт', value: '3,500 т' },
            { label: 'Длина', value: 'До 32 м' },
            { label: 'Линия', value: '450 п.м.' }
        ]
    },
    {
        id: 'kazan-eco',
        title: 'Эко-Технопарк «Волга»',
        location: 'Казань',
        region: 'regions',
        category: 'industrial',
        description: 'Фундаментные работы для промышленного комплекса переработки отходов.',
        challenge: 'Неоднородные грунты с включениями скальных пород. Требование высокой несущей способности.',
        solution: 'Лидерное бурение с последующим погружением забивных ЖБ свай сечением 400х400мм.',
        year: '2022',
        latitude: 55.79,
        longitude: 49.12,
        image: '/assets/projects/kazan.png',
        tags: ['Забивные сваи', 'Лидерное бурение', 'Фундамент'],
        stats: [
            { label: 'Сваи', value: '1,100 шт' },
            { label: 'Сечение', value: '400 мм' },
            { label: 'Нагрузка', value: '80 т' }
        ]
    },
    {
        id: 'taman-port',
        title: 'Морской Порт «Тамань»',
        location: 'Краснодарский край',
        region: 'regions',
        category: 'marine',
        description: 'Реконструкция грузовых причалов. Погружение шпунта в условиях открытой акватории.',
        challenge: 'Коррозионная агрессивность среды, работа с плавсредств (баржи).',
        solution: 'Применение шпунта с антикоррозийным покрытием. Высокоточная забивка с использованием GPS-позиционирования.',
        year: '2022',
        latitude: 45.13,
        longitude: 36.68,
        image: '/assets/projects/taman.png',
        tags: ['Шпунт Ларсена', 'Плавкран', 'Порт'],
        stats: [
            { label: 'Шпунт', value: '800 т' },
            { label: 'Глубина', value: '18 м' },
            { label: 'Защита', value: 'Эпоксид' }
        ]
    }
];
