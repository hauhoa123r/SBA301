import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Footer } from "@/widgets/footer";
import { Header } from "@/widgets/header";

interface MainLayoutOutletContext {
    setShowChrome: Dispatch<SetStateAction<boolean>>;
}

export function MainLayout() {
    const location = useLocation();

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }, [location.pathname]);

    return <MainLayoutChrome key={location.pathname} />;
}

function MainLayoutChrome() {
    const [showChrome, setShowChrome] = useState(true);
    const outletContext: MainLayoutOutletContext = { setShowChrome };

    return (
        <div className="min-h-screen bg-brand-dark flex flex-col">
            {showChrome ? <Header /> : null}
            <main className="flex-1">
                <Outlet context={outletContext} />
            </main>
            {showChrome ? <Footer /> : null}
        </div>
    );
}
