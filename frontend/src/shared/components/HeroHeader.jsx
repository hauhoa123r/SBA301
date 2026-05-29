export default function HeroHeader() {
    return (
        <header className="container mx-auto px-6 py-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-brand-accent rounded flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-brand-accent/30">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 8.56l-1.222.524a1 1 0 000 1.838l7 3a1 1 0 00.788 0l7-3a1 1 0 000-1.838l-1.222-.524-5.383 2.307a1 1 0 01-.788 0L3.31 8.56z"></path>
                    </svg>
                </div>
                <span className="text-xl font-serif font-bold text-white tracking-wide">Edujar</span>
            </div>
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
                <a className="text-white hover:text-brand-accent no-underline transition-colors" href="#">Home</a>
                <a className="text-brand-textSecondary hover:text-white transition-colors !no-underline" href="#">About</a>                <a className="text-brand-textSecondary hover:text-white no-underline transition-colors" href="#">Course</a>
                <a className="text-brand-textSecondary hover:text-white no-underline transition-colors" href="#">Blog</a>
                <a className="text-brand-textSecondary hover:text-white no-underline transition-colors" href="#">Contact</a>
            </nav>

            <div className="flex items-center gap-4 text-sm font-medium">
                <a className="text-brand-textSecondary hover:text-white px-4 py-2 border border-brand-textSecondary/30 rounded-full no-underline transition-colors block" href="#">Login</a>
                <a className="bg-brand-accent hover:bg-brand-accentHover text-white px-6 py-2 rounded-full no-underline transition-colors shadow-md shadow-brand-accent/20 block" href="#">Get Started</a>
            </div>
        </header>
    );
}