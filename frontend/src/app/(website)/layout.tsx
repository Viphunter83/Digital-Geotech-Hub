
import { Navbar } from "@/components/layout/Navbar";

export default function WebsiteLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex min-h-screen flex-col pt-20">
            <Navbar />
            {children}
        </div>
    );
}
