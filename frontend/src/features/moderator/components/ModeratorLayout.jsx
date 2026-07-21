import {
  ChevronUp,
  ClipboardList,
  Eye,
  LayoutDashboard,
  LogOut,
  Menu,
  ReceiptText,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const MENU_GROUPS = [
  {
    icon: LayoutDashboard,
    items: [
      { label: "Dashboard", path: "/moderator", icon: ShieldCheck },
      {
        label: "Course Management",
        path: "/moderator/courses",
        activePathPrefix: "/moderator/courses",
        icon: Eye,
      },
      {
        label: "Violation Reports",
        path: "/moderator/reports/violations",
        icon: ClipboardList,
      },
      {
        label: "Refund Requests",
        path: "/moderator/transactions/refunds",
        icon: ReceiptText,
      },
    ],
  },
];

export default function ModeratorLayout({
  children,
  eyebrow,
  title,
  description,
  actions,
}) {
  const location = useLocation();

  return (
    <div
      className="min-h-screen bg-[#eef4ff] text-[#17172f]"
      style={{ fontFamily: "'Be Vietnam Pro', 'Noto Sans SC', sans-serif" }}
    >
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-80 flex-col border-r border-slate-200 bg-white shadow-[10px_0_30px_rgba(88,80,160,0.06)] lg:flex">
        <div className="flex h-[90px] items-center justify-between border-b border-slate-200 px-5">
          <Link to="/" className="flex items-center gap-3 no-underline">
            <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-red-600 shadow-lg shadow-red-600/20">
              <img
                src="/images/logo.svg"
                alt="Edujar logo"
                className="h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </span>
            <span className="text-base font-extrabold uppercase tracking-wide text-slate-950">
              Edujar
            </span>
          </Link>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-violet-700"
            aria-label="Toggle moderator menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-5 py-4">
          {MENU_GROUPS.map((group) => {
            const GroupIcon = group.icon;

            return (
              <section key={group.title} className="mb-5">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                      <GroupIcon className="h-4 w-4" />
                    </span>
                    <p className="text-xs font-extrabold uppercase tracking-wider text-violet-700">
                      {group.title}
                    </p>
                  </div>
                  <ChevronUp className="h-4 w-4 text-slate-400" />
                </div>

                <div className="ml-3 border-l border-dashed border-violet-300 pl-3">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      !item.inactive &&
                      (item.activePathPrefix
                        ? location.pathname.startsWith(item.activePathPrefix)
                        : location.pathname === item.path);

                    return (
                      <Link
                        key={`${group.title}-${item.label}`}
                        to={item.path}
                        className={`mb-1 flex h-12 items-center gap-4 rounded-lg px-4 text-base font-semibold no-underline transition ${
                          isActive
                            ? "bg-violet-600 text-white shadow-lg shadow-violet-600/25"
                            : "text-slate-700 hover:bg-violet-50 hover:text-violet-700"
                        }`}
                      >
                        <Icon
                          className={`h-5 w-5 ${isActive ? "text-white" : "text-violet-600"}`}
                        />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 p-5">
          <div className="mb-3 rounded-lg border border-violet-100 bg-violet-50 p-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white text-violet-700">
                <UserRoundCheck className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-slate-950">Moderator</p>
              </div>
            </div>
          </div>
          <Link
            to="/"
            className="flex h-12 items-center justify-center gap-2 rounded-lg border border-violet-600 bg-white text-sm font-bold text-violet-700 no-underline transition hover:bg-violet-50"
          >
            <LogOut className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </aside>

      <main className="min-h-screen lg:pl-80">
        <div className="border-b border-slate-200 bg-white px-5 py-4 lg:hidden">
          <div className="flex items-center justify-between">
            <Link
              to="/moderator"
              className="flex items-center gap-3 text-slate-950 no-underline"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600">
                <img
                  src="/images/logo.svg"
                  alt="Edujar logo"
                  className="h-8 w-auto object-contain"
                />
              </span>
              <span className="font-extrabold uppercase">Edujar</span>
            </Link>
            <span className="rounded-lg bg-violet-50 px-3 py-1 text-xs font-bold uppercase text-violet-700">
              Moderator
            </span>
          </div>
        </div>

        <section className="bg-[#f8fbff] px-5 py-10 md:px-10 lg:min-h-[360px] lg:px-16 lg:py-16">
          <div className="mx-auto grid max-w-7xl gap-8 xl:grid-cols-[1fr_520px] xl:items-start">
            <div className="max-w-4xl">
              {eyebrow && (
                <span className="mb-8 inline-flex rounded-full bg-violet-600 px-4 py-1.5 text-sm font-bold text-white shadow-lg shadow-violet-600/20">
                  {eyebrow}
                </span>
              )}
              <h1 className="text-4xl font-extrabold leading-tight tracking-normal text-[#17172f] md:text-6xl">
                {title}
              </h1>
              {description && (
                <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-700">
                  {description}
                </p>
              )}
            </div>

            {actions && <div className="grid gap-5">{actions}</div>}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-10 md:px-10 lg:px-16">
          {children}
        </section>
      </main>
    </div>
  );
}
