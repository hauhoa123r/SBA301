export default function CoursePartners() {
    return (
        <section className="container mx-auto px-6 pb-20">
            <div className="relative">
                <div className="flex items-center gap-4 mb-8">
                    <div className="h-px bg-brand-light flex-grow max-w-[40px]"></div>
                    <h3 className="text-lg font-medium text-brand-textSecondary tracking-wider">Our Course Partners</h3>
                    <div className="h-px bg-brand-light flex-grow"></div>
                </div>
                <div className="bg-brand-light bg-opacity-30 backdrop-blur-sm rounded-2xl p-8 flex items-center justify-between border border-brand-cardBg overflow-x-auto gap-8 hide-scrollbar">
                    <div className="flex items-center gap-2 text-white font-bold text-xl opacity-60 hover:opacity-100 transition-opacity whitespace-nowrap">
                        <div className="w-6 h-6 rounded-full bg-orange-500"></div> HubSpot
                    </div>
                    <div className="flex items-center gap-2 text-white font-bold text-xl opacity-60 hover:opacity-100 transition-opacity whitespace-nowrap">
                        <div className="w-6 h-6 rounded-full bg-purple-500 flex flex-wrap">
                            <div className="w-1/2 h-1/2 bg-white rounded-tl-full"></div>
                        </div> loom
                    </div>
                    <div className="flex items-center gap-2 text-white font-bold text-xl opacity-60 hover:opacity-100 transition-opacity whitespace-nowrap">
                        <div className="w-6 h-6 text-purple-400">
                            <svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6"><path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 0 1-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 0 1 5.1 2a.42.42 0 0 1 .4.28l2.44 7.51L12 12l4.06-2.21 2.44-7.51a.42.42 0 0 1 .4-.28.42.42 0 0 1 .39.28l2.44 7.51 1.22 3.78a.84.84 0 0 1-.3.94Z"></path></svg>
                        </div> GitLab
                    </div>
                    <div className="flex items-center gap-2 text-white font-bold text-xl opacity-60 hover:opacity-100 transition-opacity whitespace-nowrap">
                        <div className="w-6 h-6 bg-indigo-500 rounded flex items-center justify-center text-xs">💬</div> LiveChat
                    </div>
                    <div className="flex items-center gap-2 text-white font-bold text-xl opacity-60 hover:opacity-100 transition-opacity whitespace-nowrap">
                        <div className="flex gap-1">
                            <div className="w-2 h-4 bg-purple-500 rounded"></div>
                            <div className="w-2 h-4 bg-fuchsia-500 rounded"></div>
                            <div className="w-2 h-4 bg-indigo-500 rounded"></div>
                        </div> monday<span className="text-sm font-normal">.com</span>
                    </div>
                </div>
            </div>
        </section>
    );
}