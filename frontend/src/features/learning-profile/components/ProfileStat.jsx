export default function ProfileStat({ icon: Icon, label, value, color }) {
    return (
        <div className="flex items-center gap-4 rounded-2xl border border-[#7c3aed]/15 bg-[#0f0920] p-5">
            <div className={`grid h-14 w-14 place-items-center rounded-2xl bg-[#160e2e] ${color}`}>
                <Icon className="h-6 w-6" />
            </div>
            <div>
                <p className="text-sm font-semibold text-[#94a3b8]">{label}</p>
                <p className={`mt-1 text-xl font-black ${color}`}>{value}</p>
            </div>
        </div>
    );
}
