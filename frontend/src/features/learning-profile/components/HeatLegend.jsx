export default function HeatLegend({ color, label }) {
    return (
        <span className="inline-flex items-center gap-2">
            <span className={`h-3 w-3 rounded ${color}`} />
            {label}
        </span>
    );
}
