import Logo from "./Logo";
import {
    FaTwitter,
    FaGithub,
    FaLinkedin,
    FaYoutube
} from "react-icons/fa";
export default function HeroFooter() {
    return (
        <footer className="border-t border-brand-accent/10 py-16 px-6">
            <div className="container mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
                    <div className="md:col-span-1">
                        <Logo />
                        <p className="text-brand-textSecondary text-sm mt-4 leading-relaxed max-w-xs" style={{ fontFamily: "'Inter', sans-serif" }}>
                            Vietnam's premium online learning platform. Master skills that matter.
                        </p>
                        <div className="flex items-center gap-3 mt-6">
                            {[FaTwitter, FaGithub, FaLinkedin, FaYoutube].map((Icon, i) => (
                                <a key={i} href="#" className="w-8 h-8 rounded-lg bg-brand-cardBg border border-brand-accent/15 flex items-center justify-center text-brand-textSecondary hover:text-brand-accentSoft hover:border-brand-accent/40 transition-all no-underline">
                                    <Icon className="w-3.5 h-3.5" />
                                </a>
                            ))}
                        </div>
                    </div>
                    {[
                        { title: "Platform", links: ["Browse Courses", "Become an Instructor", "Enterprise", "Pricing"] },
                        { title: "Company", links: ["About Us", "Blog", "Careers", "Press Kit"] },
                        { title: "Support", links: ["Help Center", "Community", "Terms of Service", "Privacy Policy"] },
                    ].map(({ title, links }) => (
                        <div key={title}>
                            <h4 className="text-brand-white font-semibold text-sm mb-4" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>{title}</h4>
                            <ul className="flex flex-col gap-2.5">
                                {links.map((link) => (
                                    <li key={link}>
                                        <a href="#" className="text-brand-textSecondary hover:text-brand-accentSoft text-sm no-underline transition-colors" style={{ fontFamily: "'Inter', sans-serif" }}>
                                            {link}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
                <div className="border-t border-brand-accent/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-brand-textSecondary text-xs" style={{ fontFamily: "'Inter', sans-serif" }}>© 2025 Edujar. All rights reserved.</p>
                    <p className="text-brand-textSecondary text-xs" style={{ fontFamily: "'Inter', sans-serif" }}>Built with passion in Vietnam 🇻🇳</p>
                </div>
            </div>
        </footer>
    );
}