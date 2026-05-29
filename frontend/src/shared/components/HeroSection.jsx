export default function HeroSection() {
    return (
        <main className="container mx-auto px-6 pt-16 pb-24 grid md:grid-cols-2 gap-12 items-center relative overflow-hidden">
            <div className="z-10">
                <h1 className="text-5xl md:text-6xl font-serif font-bold leading-tight mb-6 text-white">
                    Best courses are<br />
                    waiting to enrich<br />
                    your skill
                    <span className="text-brand-accent align-middle ml-2 text-3xl">+++</span>
                </h1>
                <p className="text-brand-textSecondary mb-10 max-w-md text-lg">
                    Provides you with the latest online learning system and material that help your knowledge growing.
                </p>

                {/* Đảm bảo ô tìm kiếm có overflow-hidden để bo tròn tuyệt đối */}
                <div className="bg-white rounded-full p-2 flex items-center shadow-xl max-w-md overflow-hidden">
                    <div className="pl-4 text-gray-400 flex items-center">
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path clipRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" fillRule="evenodd"></path>
                        </svg>
                    </div>
                    <input className="w-full bg-transparent border-0 focus:outline-none focus:ring-0 text-gray-800 placeholder-gray-400 px-3 h-10" placeholder="Want to learn?" type="text" />
                    <button className="bg-brand-accent hover:bg-brand-accentHover text-white px-6 py-3 rounded-full font-medium transition-colors whitespace-nowrap cursor-pointer">
                        Explore
                    </button>
                </div>
            </div>

            <div className="relative z-10 hidden md:block">
                <div className="absolute inset-0 bg-brand-light rounded-full w-[400px] h-[500px] -right-12 -top-12 z-0 transform -rotate-12 opacity-40 blur-2xl"></div>
                <div className="relative z-10 w-full max-w-[400px] mx-auto h-[500px] bg-brand-cardBg rounded-3xl overflow-hidden flex items-center justify-center border-4 border-brand-accent border-opacity-20 shadow-2xl">
                    <span className="text-brand-textSecondary">Character Illustration Placeholder</span>
                </div>
                <div className="absolute top-10 right-20 w-8 h-8 bg-brand-accent rounded-full animate-pulse opacity-60"></div>
                <div className="absolute bottom-20 -left-10 w-12 h-12 bg-purple-500 rounded flex items-center justify-center transform rotate-12 opacity-40">
                    <div className="w-6 h-6 bg-white rounded-sm opacity-50"></div>
                </div>
            </div>
        </main>
    );
}