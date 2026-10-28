import { useEffect, useRef, useState } from "react";
import { Loader2, RefreshCw, VideoOff, BookmarkCheck } from "lucide-react";

export default function TrackedVideo({ lesson, playback, onSave, onComplete, active = true }) {
    const [loading, setLoading] = useState(true);
    const [failed, setFailed] = useState(false);
    const video = useRef(null);
    const pending = useRef(0);
    const lastTick = useRef(null);
    const lastPosition = useRef(playback?.positionSeconds ?? 0);
    const metadataLoaded = useRef(false);
    const save = useRef(onSave);
    useEffect(() => { save.current = onSave; }, [onSave]);
    useEffect(() => {
        // Pausing retains the native player and position; its pause handler flushes progress.
        if (!active) video.current?.pause();
    }, [active]);

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
        <div className="workspace-video" aria-busy={loading && !failed}>
        <video ref={video} controls playsInline preload="metadata" src={lesson.videoUrl} className="aspect-video w-full bg-brand-black object-contain"
            aria-label={`Video bài học ${lesson.title}`}
            onLoadedMetadata={() => {
                metadataLoaded.current = true;
                if (lastPosition.current > 0 && Number.isFinite(video.current.duration))
                    video.current.currentTime = Math.min(lastPosition.current, Math.max(0, video.current.duration - 1));
                lastPosition.current = Math.floor(video.current.currentTime || 0);
            }}
            onLoadedData={() => setLoading(false)} onCanPlay={() => setLoading(false)} onWaiting={() => setLoading(true)}
            onPlaying={() => setLoading(false)} onError={() => { setFailed(true); setLoading(false); lastTick.current = null; }}
            onPlay={() => { lastTick.current = performance.now(); }} onTimeUpdate={track}
            onSeeking={() => { lastTick.current = null; }}
            onPause={() => { lastTick.current = null; flush(); }}
            onEnded={() => { flush(); onComplete?.(); }} />
        {loading && !failed && <div className="workspace-video-loading" role="status"><Loader2 size={28} className="animate-spin" /><span>Đang tải video bài học…</span></div>}
        {failed && <div className="workspace-video-error" role="alert"><VideoOff size={30} /><h3>Chưa thể phát video</h3><p>Kiểm tra kết nối hoặc thử tải lại. Bạn vẫn có thể ôn từ vựng và mẫu câu.</p><button type="button" className="workspace-secondary-button" onClick={() => { setFailed(false); setLoading(true); metadataLoaded.current = false; video.current?.load(); }}><RefreshCw size={16} />Tải lại video</button></div>}
        </div>
        <p className="workspace-video-caption"><BookmarkCheck size={14} />Vị trí xem được lưu khi tạm dừng và trong lúc xem.</p>
    </>;
}
