
import { Navbar } from "@/components/layout/Navbar";
import { CookieConsent } from "@/components/layout/CookieConsent";

export default function WebsiteLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col min-h-screen bg-[#0F172A]">
            <Navbar />
            {children}
            <CookieConsent />
        </div>
    );
}
