import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import HeroFooter from "../components/HeroFooter";
import HeroHeader from "../components/HeroHeader";

export default function MainLayout() {
    const [showChrome, setShowChrome] = useState(true);
    const location = useLocation();

    useEffect(() => {
        setShowChrome(true);
    }, [location.pathname]);

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
