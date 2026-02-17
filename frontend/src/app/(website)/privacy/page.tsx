"use client";

import { EngineeringBackground } from "@/components/ui/EngineeringBackground";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { motion } from "framer-motion";

export default function PrivacyPage() {
    return (
        <main className="flex-1 relative">
            <EngineeringBackground />
            <Navbar />
            <div className="relative z-10 pt-40 pb-20 px-6">
                <div className="container mx-auto max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-3xl p-8 md:p-12"
                    >
                        <h1 className="font-outfit font-black text-4xl md:text-5xl uppercase tracking-tighter text-white mb-8 border-b border-white/10 pb-8">
                            Политика конфиденциальности
                        </h1>

                        <div className="prose prose-invert max-w-none space-y-8 text-white/70 leading-relaxed font-outfit">
                            <section>
                                <p>
                                    Настоящая Политика конфиденциальности (далее — Политика) действует в отношении всей информации, которую ООО «Диджитал Геотех Хаб» (далее — Компания) может получить о пользователе во время использования им сайта https://geotech-hub.ru (далее — Сайт).
                                </p>
                            </section>

                            <section>
                                <h2 className="text-white font-black uppercase text-xl tracking-tight mb-4">1. Персональные данные, которые мы обрабатываем</h2>
                                <p>Компания собирает и обрабатывает следующие данные:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li><strong>Данные из форм обратной связи</strong>: Имя, номер телефона, адрес электронной почты, название компании.</li>
                                    <li><strong>Технические данные</strong>: IP-адрес, тип браузера, время доступа, Cookie.</li>
                                    <li><strong>Данные для AI-аудита</strong>: Информация из загружаемых технических заданий и смет (которые могут содержать персональные данные).</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-white font-black uppercase text-xl tracking-tight mb-4">2. Цели обработки</h2>
                                <p>Мы обрабатываем ваши данные для:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Связи с вами после отправки заявки (лида).</li>
                                    <li>Предоставления результатов автоматического технического аудита.</li>
                                    <li>Улучшения работы Сайта и наших сервисов.</li>
                                    <li>Выполнения требований законодательства РФ.</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-white font-black uppercase text-xl tracking-tight mb-4">3. Правовые основания (152-ФЗ)</h2>
                                <p>Обработка осуществляется на следующих основаниях:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Ваше согласие на обработку персональных данных.</li>
                                    <li>Заключение и исполнение договора с Компанией (в том числе в форме публичной оферты).</li>
                                    <li>Выполнение возложенных на Компанию законодательством РФ функций.</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-white font-black uppercase text-xl tracking-tight mb-4">4. Ваши права</h2>
                                <p>Вы имеете право:</p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Получать информацию об обработке ваших данных.</li>
                                    <li>Требовать уточнения, блокирования или уничтожения данных в случае их неполноты или неточности.</li>
                                    <li>Отозвать согласие на обработку, направив письмо на адрес: <a href="mailto:drilling.rigs.info@yandex.ru" className="text-accent underline">drilling.rigs.info@yandex.ru</a>.</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-white font-black uppercase text-xl tracking-tight mb-4">5. Безопасность</h2>
                                <p>
                                    Компания принимает необходимые организационные и технические меры для защиты персональных данных от неправомерного доступа, изменения или раскрытия. Все данные хранятся на серверах, расположенных на территории Российской Федерации.
                                </p>
                            </section>

                            <footer className="pt-8 border-t border-white/10 text-sm italic">
                                Дата последнего обновления: 16 февраля 2026 г.
                            </footer>
                        </div>
                    </motion.div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
