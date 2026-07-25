import { AnimatedCard } from "@/shared/ui";

export default function ProfileStat({ icon: Icon, label, value, color }) {
    return (
        <AnimatedCard className="flex h-full items-center gap-4 rounded-2xl border border-brand-accent/15 bg-brand-menu p-5">
            <div className={`grid h-14 w-14 place-items-center rounded-2xl bg-brand-light ${color}`}>
                <Icon className="h-6 w-6" />
            </div>
            <div>
                <p className="text-sm font-semibold text-brand-textSecondary">{label}</p>
                <p className={`mt-1 text-xl font-black ${color}`}>{value}</p>
            </div>
        </AnimatedCard>
    );
}
