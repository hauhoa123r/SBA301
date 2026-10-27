import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { BookOpen, ChevronLeft, ChevronRight, ExternalLink, Menu, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import UserProfileMenu from "@/features/auth/ui/UserProfileMenu";
import { useAccessibleDialog } from "@/features/payment/model/useAccessibleDialog";
import { adminNavigation } from "./navigation";
import { useContentEntrance } from "./motion";

function useMobile() {
  const [mobile, setMobile] = useState(() => window.matchMedia("(max-width: 1023px)").matches);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 1023px)");
    const change = () => setMobile(media.matches); media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, []);
  return mobile;
}

export function AdminSidebar({ collapsed, mobile, close }: { collapsed: boolean; mobile: boolean; close: () => void }) {
  const location = useLocation();
  const navRef = useRef<HTMLElement>(null);
  const markerRef = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const nav = navRef.current; const marker = markerRef.current;
    if (!nav || !marker) return;
    const update = () => {
      const active = nav.querySelector<HTMLElement>(".admin-nav-link.active");
      marker.hidden = !active;
      if (active) {
        marker.style.transform = `translateY(${active.offsetTop}px)`;
        marker.style.height = `${active.offsetHeight}px`;
      }
    };
    update(); const observer = new ResizeObserver(update); observer.observe(nav);
    return () => observer.disconnect();
  }, [location.pathname, collapsed]);
  return <>
    <div className="admin-sidebar-brand"><Link to="/admin/dashboard" className="admin-brand" aria-label="Edujar · Tổng quan" onClick={close}>
      <span className="admin-brand-mark"><BookOpen size={22} strokeWidth={2} aria-hidden="true" /></span><span className="admin-brand-name">edujar<span className="admin-brand-dot">.</span><small>ADMIN WORKSPACE</small></span>
    </Link>{mobile && <button className="admin-icon-button" aria-label="Đóng điều hướng" onClick={close}><X size={20} /></button>}</div>
    <nav ref={navRef} aria-label="Điều hướng quản trị"><span ref={markerRef} className="admin-nav-indicator" aria-hidden="true" />{adminNavigation.map(group => <section className="admin-nav-group" key={group.label}>
      <h2>{group.label}</h2>{group.items.map(item => {
        const active = item.end ? location.pathname === item.to : location.pathname === item.to || location.pathname.startsWith(item.to + "/");
        return <NavLink key={item.to} end={item.end} to={item.to} className={active ? "admin-nav-link active" : "admin-nav-link"}
          title={collapsed ? item.label : undefined} aria-label={collapsed ? item.label : undefined} onClick={close}>
          <item.icon size={18} strokeWidth={1.7} aria-hidden="true" /><span>{item.label}</span>{active && !collapsed && <span className="admin-nav-active-dot" aria-hidden="true" />}
        </NavLink>;
      })}
    </section>)}</nav>
    <div className="admin-sidebar-footer"><span className="admin-workspace-dot" /><span>Edujar workspace<small>Quản trị học tập trực tuyến</small></span></div>
  </>;
}

export function AdminHeader({ toggle, collapsed, mobile }: { toggle: () => void; collapsed: boolean; mobile: boolean }) {
  return <header className="admin-topbar"><div className="admin-topbar-start"><button type="button" className="admin-icon-button admin-sidebar-toggle" onClick={toggle}
    aria-label={mobile ? "Mở điều hướng" : collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"} aria-controls="admin-navigation" aria-expanded={!collapsed}>
    {mobile ? <Menu size={22} /> : collapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
  </button><span className="admin-topbar-name">Không gian quản trị <span>Edujar</span></span></div>
    <div className="admin-topbar-actions"><Link className="admin-website-link" to="/" title="Về website Edujar"><ExternalLink size={16} aria-hidden="true" /><span>Về website</span></Link>
      <span className="admin-topbar-divider" /><div className="admin-profile"><UserProfileMenu /></div>
    </div>
  </header>;
}

export function AdminLayout({ title, children }: { title: string; children: ReactNode }) {
  const mobile = useMobile(); const [drawer, setDrawer] = useState(false);
  const [collapsed, setCollapsed] = useState(() => { try { return localStorage.getItem("edujar-admin-sidebar") === "collapsed"; } catch { return false; } });
  const drawerRef = useRef<HTMLDivElement>(null); const location = useLocation();
  const pageRef = useRef<HTMLDivElement>(null);
  const previousPath = useRef(location.pathname);
  useContentEntrance(pageRef, location.pathname);
  useEffect(() => {
    if (previousPath.current !== location.pathname) {
      previousPath.current = location.pathname;
      pageRef.current?.querySelector<HTMLElement>("h1")?.focus({ preventScroll: true });
    }
  }, [location.pathname]);
  useAccessibleDialog({ open: mobile && drawer, onClose: () => setDrawer(false), dialogRef: drawerRef });
  function toggle() {
    if (mobile) setDrawer(value => !value);
    else { setCollapsed(value => !value); try { localStorage.setItem("edujar-admin-sidebar", collapsed ? "expanded" : "collapsed"); } catch { /* Optional UI preference. */ } }
  }
  const active = adminNavigation.flatMap(group => group.items).find(item => item.to === location.pathname || (!item.end && location.pathname.startsWith(item.to + "/")));
  const parent = adminNavigation.find(group => group.items.includes(active!))?.label ?? "Quản lý";
  return <div className={`admin-shell ${collapsed ? "admin-is-collapsed" : ""}`}>
    <a className="admin-skip-link" href="#admin-content">Chuyển đến nội dung chính</a>
    {!mobile && <aside className="admin-sidebar" id="admin-navigation"><AdminSidebar collapsed={collapsed} mobile={false} close={() => {}} />
      <button className="admin-sidebar-collapse" aria-label={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"} onClick={toggle}>{collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}</button>
    </aside>}
    {mobile && drawer && <div className="admin-drawer-backdrop" onClick={event => { if (event.target === event.currentTarget) setDrawer(false); }}>
      <div className="admin-sidebar admin-drawer" ref={drawerRef} id="admin-navigation" role="dialog" aria-modal="true" aria-label="Điều hướng quản trị" tabIndex={-1}>
        <AdminSidebar collapsed={false} mobile close={() => setDrawer(false)} />
      </div>
    </div>}
    <div className="admin-work-area"><AdminHeader toggle={toggle} collapsed={mobile ? !drawer : collapsed} mobile={mobile} />
      <main className="admin-main" id="admin-content" tabIndex={-1}>
        <div className="admin-page-surface" ref={pageRef}><div className="admin-page-header"><nav className="admin-breadcrumb" aria-label="Đường dẫn"><Link to="/admin/dashboard">Trang chủ</Link><ChevronRight size={12} aria-hidden="true" /><span>{parent}</span>
          <ChevronRight size={12} aria-hidden="true" /><span aria-current="page">{active?.label ?? title}</span></nav><h1 tabIndex={-1}>{title}</h1></div>
        {children}
        </div>
        <footer className="admin-page-footer"><span>Edujar · Học tiếng Trung mỗi ngày</span><Link to="/contact">Liên hệ hỗ trợ</Link></footer>
      </main>
    </div>
  </div>;
}
