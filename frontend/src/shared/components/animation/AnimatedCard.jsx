import "./userMotion.css";

export default function AnimatedCard({ as: Component = "div", children, className = "", ...props }) {
    return (
        <Component className={`user-interactive-card ${className}`.trim()} {...props}>
            {children}
        </Component>
    );
}
