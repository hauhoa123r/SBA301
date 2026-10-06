import { useEffect, useRef } from "react";

export default function TrackedVideo({ lesson, playback, onSave, onComplete }) {
    const video = useRef(null);
    const pending = useRef(0);
    const lastTick = useRef(null);
    const lastPosition = useRef(playback?.positionSeconds ?? 0);
    const metadataLoaded = useRef(false);
    const save = useRef(onSave);
    useEffect(() => { save.current = onSave; }, [onSave]);

    const flush = () => {
        if (!video.current || !metadataLoaded.current) return;
        const position = Math.min(86400, Math.max(0, Math.floor(video.current.currentTime || 0)));
        const watched = Math.min(30, Math.floor(pending.current));
        if (position === lastPosition.current && watched === 0) return;
        pending.current -= watched;
        lastPosition.current = position;
        save.current?.({ positionSeconds: position, watchedSeconds: watched }).catch(() => {
            pending.current = Math.min(30, pending.current + watched);
            lastPosition.current = -1;
        });
    };

    useEffect(() => {
        const handleVisibility = () => {
            if (document.hidden) { lastTick.current = null; flush(); }
        };
        document.addEventListener("visibilitychange", handleVisibility);
        const element = video.current;
        return () => {
            // The node can already be detached when React runs the cleanup.
            const position = Math.min(86400, Math.max(0, Math.floor(element?.currentTime || 0)));
            const watched = Math.min(30, Math.floor(pending.current));
            if (metadataLoaded.current && (watched || position !== lastPosition.current))
                save.current?.({ positionSeconds: position, watchedSeconds: watched }).catch(() => {});
            document.removeEventListener("visibilitychange", handleVisibility);
        };
    }, []);

    const track = () => {
        const element = video.current;
        const now = performance.now();
        if (!element.paused && !element.seeking && !document.hidden && lastTick.current !== null)
            pending.current += Math.min(1, (now - lastTick.current) / 1000);
        lastTick.current = element.paused || element.seeking || document.hidden ? null : now;
        if (pending.current >= 15) flush();
    };

    return <>
        <video ref={video} controls src={lesson.videoUrl} className="aspect-video w-full bg-brand-black object-contain"
            aria-label={`Video bài học ${lesson.title}`}
            onLoadedMetadata={() => {
                metadataLoaded.current = true;
                if (playback?.positionSeconds > 0 && Number.isFinite(video.current.duration))
                    video.current.currentTime = Math.min(playback.positionSeconds, Math.max(0, video.current.duration - 1));
                lastPosition.current = Math.floor(video.current.currentTime || 0);
            }}
            onPlay={() => { lastTick.current = performance.now(); }} onTimeUpdate={track}
            onSeeking={() => { lastTick.current = null; }}
            onPause={() => { lastTick.current = null; flush(); }}
            onEnded={() => { flush(); onComplete?.(); }} />
        <p className="px-4 py-2 text-xs text-brand-textSecondary">Vị trí xem được lưu khi tạm dừng và định kỳ trong lúc xem.</p>
    </>;
}
