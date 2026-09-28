export interface NavigationItem {
    readonly label: string;
    readonly path: string;
}

export const NAV_LINKS = [
    {
        label: "Trang chủ",
        path: "/",
    },
    {
        label: "Giới thiệu",
        path: "/about",
    },
    {
        label: "Khóa học",
        path: "/courses",
    },
    {
        label: "Gói học",
        path: "/subscriptions",
    },
    {
        label: "Bài viết",
        path: "/blog",
    },
    {
        label: "Liên hệ",
        path: "/contact",
    },
] satisfies readonly NavigationItem[];
