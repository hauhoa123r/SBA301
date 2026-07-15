import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import HeroFooter from "../components/HeroFooter";
import HeroHeader from "../components/HeroHeader";

export default function MainLayout() {
    const location = useLocation();
    const isAdminRoute = location.pathname === "/admin" || location.pathname.startsWith("/admin/");

    useEffect(() => {
        if (!isAdminRoute) {
            window.scrollTo({ top: 0, left: 0, behavior: "auto" });
        }
    }, [isAdminRoute, location.pathname]);

    return <MainLayoutChrome key={location.pathname} />;
}

function MainLayoutChrome() {
    const [showChrome, setShowChrome] = useState(true);

    return (
        <div className="min-h-screen bg-brand-dark flex flex-col">
            {showChrome ? <HeroHeader /> : null}
            <main className="flex-1">
                <Outlet context={{ setShowChrome }} />
            </main>
            {showChrome ? <HeroFooter /> : null}
        </div>
    );
}
