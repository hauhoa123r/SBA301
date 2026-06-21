import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
    BookOpen,
    CheckCircle2,
    ChevronRight,
    Circle,
    Clock,
    Download,
    Expand,
    FileText,
    Lock,
    Minimize,
    Pause,
    PlayCircle,
    RotateCcw,
    Volume2,
} from "lucide-react";
import HeroFooter from "../../../shared/components/HeroFooter";
import HeroHeader from "../../../shared/components/HeroHeader";
import { COURSES } from "../../course/services/mockup";
import { ENROLLED_COURSE_LESSONS } from "../service/learningMock";

export default function LearnCoursePage() {
    const { courseId } = useParams();
    const activeCourseId = Number(courseId || 1);
    const course = COURSES.find((item) => item.id === activeCourseId) || COURSES[0];
    const lessons = ENROLLED_COURSE_LESSONS.filter((lesson) => lesson.course_id === course.id);
    const [activeLessonId, setActiveLessonId] = useState(lessons[0]?.id);
    const [completedLessons, setCompletedLessons] = useState(() => new Set());
    const [watchedSecondsByLesson, setWatchedSecondsByLesson] = useState({});
    const [videoDurationByLesson, setVideoDurationByLesson] = useState({});
    const [currentSecondsByLesson, setCurrentSecondsByLesson] = useState({});
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [controlsVisible, setControlsVisible] = useState(true);
    const videoRef = useRef(null);
    const videoShellRef = useRef(null);
    const controlsHideTimerRef = useRef(null);
    const singleClickTimerRef = useRef(null);

    const activeLesson = lessons.find((lesson) => lesson.id === activeLessonId) || lessons[0];
    const progress = lessons.length ? Math.round((completedLessons.size / lessons.length) * 100) : 0;
    const watchedSeconds = watchedSecondsByLesson[activeLesson?.id] || 0;
    const currentSeconds = currentSecondsByLesson[activeLesson?.id] || 0;
    const videoDuration = videoDurationByLesson[activeLesson?.id] || 0;
    const watchProgress = videoDuration ? Math.min(100, Math.round((watchedSeconds / videoDuration) * 100)) : 0;
    const currentProgress = videoDuration ? Math.min(100, (currentSeconds / videoDuration) * 100) : 0;
    const unlockedProgress = videoDuration ? Math.min(100, (watchedSeconds / videoDuration) * 100) : 0;

    const chapterGroups = useMemo(() => {
        return lessons.reduce((groups, lesson) => {
            if (!groups[lesson.chapter]) groups[lesson.chapter] = [];
            groups[lesson.chapter].push(lesson);
            return groups;
        }, {});
    }, [lessons]);

    useEffect(() => {
        const handleFullscreenChange = () => {
            const fullscreenActive = document.fullscreenElement === videoShellRef.current;
            setIsFullscreen(fullscreenActive);
            setControlsVisible(true);
        };

        document.addEventListener("fullscreenchange", handleFullscreenChange);

        return () => {
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
            clearTimeout(controlsHideTimerRef.current);
            clearTimeout(singleClickTimerRef.current);
        };
    }, []);

    useEffect(() => {
        if (!isFullscreen) {
            clearTimeout(controlsHideTimerRef.current);
            return;
        }

        clearTimeout(controlsHideTimerRef.current);
        controlsHideTimerRef.current = setTimeout(() => {
            setControlsVisible(false);
        }, 2200);

        return () => clearTimeout(controlsHideTimerRef.current);
    }, [isFullscreen, isPlaying, activeLesson.id]);

    const handleLoadedMetadata = (event) => {
        event.currentTarget.playbackRate = playbackRate;
        const duration = event.currentTarget.duration || 0;

        setVideoDurationByLesson((prev) => ({
            ...prev,
            [activeLesson.id]: duration,
        }));
    };

    const handleTimeUpdate = (event) => {
        const video = event.currentTarget;
        const currentTime = video.currentTime || 0;
        const maxWatched = watchedSecondsByLesson[activeLesson.id] || 0;

        if (!completedLessons.has(activeLesson.id) && currentTime > maxWatched + 1.5) {
            video.currentTime = maxWatched;
            return;
        }

        setCurrentSecondsByLesson((prev) => ({
            ...prev,
            [activeLesson.id]: currentTime,
        }));
        setWatchedSecondsByLesson((prev) => ({
            ...prev,
            [activeLesson.id]: Math.max(prev[activeLesson.id] || 0, currentTime),
        }));
    };

    const handleSeeking = (event) => {
        const video = event.currentTarget;
        const maxWatched = watchedSecondsByLesson[activeLesson.id] || 0;

        if (!completedLessons.has(activeLesson.id) && video.currentTime > maxWatched + 1) {
            video.currentTime = maxWatched;
        }
    };

    const handleVideoEnded = () => {
        setIsPlaying(false);
        setCompletedLessons((prev) => new Set(prev).add(activeLesson.id));
        setWatchedSecondsByLesson((prev) => ({
            ...prev,
            [activeLesson.id]: videoDurationByLesson[activeLesson.id] || videoRef.current?.duration || 0,
        }));
    };

    const resetProgress = () => {
        setCompletedLessons(new Set());
        setWatchedSecondsByLesson({});
        setVideoDurationByLesson({});
        if (videoRef.current) {
            videoRef.current.currentTime = 0;
        }
        setCurrentSecondsByLesson({});
        setIsPlaying(false);
    };

    const togglePlay = () => {
        if (!videoRef.current) return;

        if (videoRef.current.paused) {
            videoRef.current.play();
            setIsPlaying(true);
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    };

    const showFullscreenControls = () => {
        if (!isFullscreen) return;

        setControlsVisible(true);
        clearTimeout(controlsHideTimerRef.current);
        controlsHideTimerRef.current = setTimeout(() => {
            setControlsVisible(false);
        }, 2200);
    };

    const handlePlaybackRateChange = (event) => {
        const nextRate = Number(event.target.value);
        setPlaybackRate(nextRate);

        if (videoRef.current) {
            videoRef.current.playbackRate = nextRate;
        }
    };

    const handleProgressClick = (event) => {
        if (!videoRef.current || !videoDuration) return;

        const rect = event.currentTarget.getBoundingClientRect();
        const clickRatio = (event.clientX - rect.left) / rect.width;
        const requestedTime = Math.max(0, Math.min(videoDuration, clickRatio * videoDuration));
        const maxAllowedTime = completedLessons.has(activeLesson.id) ? videoDuration : watchedSeconds;
        const nextTime = Math.min(requestedTime, maxAllowedTime);

        videoRef.current.currentTime = nextTime;
        setCurrentSecondsByLesson((prev) => ({
            ...prev,
            [activeLesson.id]: nextTime,
        }));
    };

    const toggleFullscreen = () => {
        const target = videoShellRef.current;
        if (!target) return;

        if (document.fullscreenElement) {
            document.exitFullscreen();
            return;
        }

        target.requestFullscreen?.();
    };

    const handleVideoClick = () => {
        clearTimeout(singleClickTimerRef.current);
        singleClickTimerRef.current = setTimeout(() => {
            togglePlay();
        }, 220);
    };

    const handleVideoDoubleClick = () => {
        clearTimeout(singleClickTimerRef.current);
        toggleFullscreen();
    };

    const formatTime = (seconds) => {
        if (!Number.isFinite(seconds) || seconds <= 0) return "0:00";

        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, "0");
        return `${minutes}:${remainingSeconds}`;
    };

    if (!activeLesson) {
        return (
            <div className="min-h-screen bg-brand-dark text-brand-textPrimary">
                <HeroHeader />
                <main className="container mx-auto px-6 py-20">
                    <div className="rounded-2xl border border-brand-accent/10 bg-brand-cardBg p-10 text-center">
                        <h1 className="text-3xl font-bold text-white">No lessons available</h1>
                        <Link to="/courses" className="mt-5 inline-flex text-[#a78bfa] no-underline hover:text-white">
                            Back to courses
                        </Link>
                    </div>
                </main>
                <HeroFooter />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-brand-dark text-brand-textPrimary" style={{ fontFamily: "'Inter', sans-serif" }}>
            <HeroHeader />

            <main className="container mx-auto px-6 py-10">
                <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-brand-textSecondary">
                            <Link to="/courses" className="text-brand-textSecondary no-underline transition hover:text-white">
                                Courses
                            </Link>
                            <ChevronRight className="h-4 w-4" />
                            <span className="text-[#a78bfa]">Learn Course</span>
                        </div>
                        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-brand-accent">
                            Student Learning
                        </p>
                        <h1
                            className="max-w-3xl text-3xl font-extrabold leading-tight text-white md:text-5xl"
                            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                        >
                            {course.title}
                        </h1>
                        <p className="mt-3 text-sm text-brand-textSecondary">
                            Instructor: <span className="text-white">{course.instructor}</span>
                        </p>
                    </div>

                    <div className="w-full rounded-2xl border border-brand-accent/10 bg-brand-cardBg p-5 lg:max-w-sm">
                        <div className="mb-3 flex items-center justify-between">
                            <span className="text-sm font-semibold text-white">Learning progress</span>
                            <span className="text-sm font-bold text-[#a78bfa]">{progress}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-brand-light">
                            <div className="h-full rounded-full bg-brand-accent transition-all" style={{ width: `${progress}%` }} />
                        </div>
                        <div className="mt-3 flex items-center justify-between text-xs text-brand-textSecondary">
                            <span>{completedLessons.size}/{lessons.length} lessons completed</span>
                            <button
                                type="button"
                                onClick={resetProgress}
                                className="inline-flex items-center gap-1 font-semibold text-brand-textSecondary transition hover:text-white"
                            >
                                <RotateCcw className="h-3.5 w-3.5" />
                                Reset
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid gap-8 xl:grid-cols-[1fr_380px]">
                    <section className="space-y-6">
                        <div
                            ref={videoShellRef}
                            onMouseMove={showFullscreenControls}
                            className="learning-video-shell overflow-hidden rounded-2xl border border-brand-accent/10 bg-black shadow-2xl shadow-brand-accent/10"
                        >
                            <video
                                ref={videoRef}
                                key={activeLesson.id}
                                src={activeLesson.video_url}
                                onClick={handleVideoClick}
                                onDoubleClick={handleVideoDoubleClick}
                                onLoadedMetadata={handleLoadedMetadata}
                                onTimeUpdate={handleTimeUpdate}
                                onSeeking={handleSeeking}
                                onEnded={handleVideoEnded}
                                onPlay={() => setIsPlaying(true)}
                                onPause={() => setIsPlaying(false)}
                                className="learning-video aspect-video w-full cursor-pointer bg-black object-cover"
                                poster={course.thumbnail_url}
                            />
                            <div
                                className={`learning-video-controls border-t border-brand-accent/10 bg-[#0f0a1f]/95 px-4 py-3 backdrop-blur-xl transition-opacity duration-300 ${isFullscreen && !controlsVisible ? "pointer-events-none opacity-0" : "opacity-100"}`}
                            >
                                <div
                                    role="slider"
                                    tabIndex={0}
                                    aria-label="Video progress"
                                    aria-valuemin={0}
                                    aria-valuemax={Math.floor(videoDuration)}
                                    aria-valuenow={Math.floor(currentSeconds)}
                                    onClick={handleProgressClick}
                                    className="group relative h-4 cursor-pointer"
                                >
                                    <div className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-brand-light">
                                        <div
                                            className="absolute left-0 top-0 h-full rounded-full bg-brand-accent/25"
                                            style={{ width: `${unlockedProgress}%` }}
                                        />
                                        <div
                                            className="absolute left-0 top-0 h-full rounded-full bg-brand-accent"
                                            style={{ width: `${currentProgress}%` }}
                                        />
                                    </div>
                                    <div
                                        className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-brand-accent shadow-lg shadow-brand-accent/40 opacity-90 transition group-hover:scale-110"
                                        style={{ left: `${currentProgress}%` }}
                                    />
                                </div>

                                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={togglePlay}
                                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-accent text-white shadow-lg shadow-brand-accent/25 transition hover:bg-brand-accentHover"
                                        >
                                            {isPlaying ? <Pause className="h-4 w-4" /> : <PlayCircle className="h-5 w-5" />}
                                        </button>
                                        <select
                                            value={playbackRate}
                                            onChange={handlePlaybackRateChange}
                                            className="h-10 rounded-xl border border-brand-accent/20 bg-brand-light px-3 text-sm font-semibold text-white outline-none transition hover:border-brand-accent/50 focus:border-brand-accent/60"
                                        >
                                            {[0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
                                                <option key={rate} value={rate}>
                                                    {rate}x
                                                </option>
                                            ))}
                                        </select>
                                        <div className="text-sm font-semibold text-white">
                                            {formatTime(currentSeconds)}
                                            <span className="mx-1 text-brand-textSecondary">/</span>
                                            <span className="text-brand-textSecondary">{formatTime(videoDuration)}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-brand-textSecondary">
                                        <span className="inline-flex items-center gap-1 rounded-lg border border-brand-accent/10 bg-brand-light/80 px-2.5 py-1.5">
                                            <Lock className="h-3.5 w-3.5 text-[#a78bfa]" />
                                            No forward seeking
                                        </span>
                                        <span className="inline-flex items-center gap-1 rounded-lg border border-brand-accent/10 bg-brand-light/80 px-2.5 py-1.5">
                                            <Volume2 className="h-3.5 w-3.5 text-[#a78bfa]" />
                                            Native volume
                                        </span>
                                        <button
                                            type="button"
                                            onClick={toggleFullscreen}
                                            className="inline-flex items-center gap-1 rounded-lg border border-brand-accent/10 bg-brand-light/80 px-2.5 py-1.5 transition hover:border-brand-accent/50 hover:text-white"
                                        >
                                            {isFullscreen ? <Minimize className="h-3.5 w-3.5 text-[#a78bfa]" /> : <Expand className="h-3.5 w-3.5 text-[#a78bfa]" />}
                                            {isFullscreen ? "Exit" : "Fullscreen"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-brand-accent/10 bg-brand-cardBg p-6">
                            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                <div>
                                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand-accent/20 bg-brand-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#a78bfa]">
                                        <PlayCircle className="h-3.5 w-3.5" />
                                        {activeLesson.chapter}
                                    </div>
                                    <h2
                                        className="text-2xl font-bold text-white"
                                        style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                                    >
                                        {activeLesson.title}
                                    </h2>
                                    <p className="mt-3 text-sm leading-6 text-brand-textSecondary">
                                        {activeLesson.summary}
                                    </p>
                                    <div className="mt-5 max-w-md">
                                        <div className="mb-2 flex items-center justify-between text-xs text-brand-textSecondary">
                                            <span>Video watch progress</span>
                                            <span>{watchProgress}%</span>
                                        </div>
                                        <div className="h-2 overflow-hidden rounded-full bg-brand-light">
                                            <div className="h-full rounded-full bg-brand-accent transition-all" style={{ width: `${watchProgress}%` }} />
                                        </div>
                                        {!completedLessons.has(activeLesson.id) && (
                                            <p className="mt-2 text-xs text-brand-textSecondary">
                                                Forward seeking is locked. Watch the video until the end to complete this lesson.
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    disabled={!completedLessons.has(activeLesson.id)}
                                    className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition ${completedLessons.has(activeLesson.id)
                                            ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/15"
                                            : "cursor-not-allowed border border-brand-accent/10 bg-brand-light text-brand-textSecondary"
                                        }`}
                                >
                                    {completedLessons.has(activeLesson.id) ? <CheckCircle2 className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                                    {completedLessons.has(activeLesson.id) ? "Completed" : "Watch full video"}
                                </button>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-brand-accent/10 bg-brand-cardBg p-6">
                            <div className="mb-5 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-white" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                                    Learning Materials
                                </h2>
                                <span className="text-sm text-brand-textSecondary">{activeLesson.materials.length} files</span>
                            </div>

                            <div className="grid gap-3 md:grid-cols-2">
                                {activeLesson.materials.map((material) => (
                                    <div
                                        key={material.id}
                                        className="flex items-center justify-between gap-4 rounded-xl border border-brand-accent/10 bg-brand-light/70 p-4"
                                    >
                                        <div className="flex min-w-0 items-center gap-3">
                                            <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-brand-accent/20 bg-brand-accent/10 text-[#a78bfa]">
                                                <FileText className="h-4 w-4" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold text-white">{material.name}</p>
                                                <p className="mt-1 text-xs text-brand-textSecondary">
                                                    {material.type} · {material.size}
                                                </p>
                                            </div>
                                        </div>
                                        <button className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-brand-accent/20 text-brand-textSecondary transition hover:border-brand-accent/60 hover:text-white">
                                            <Download className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <aside className="rounded-2xl border border-brand-accent/10 bg-brand-cardBg p-5 xl:sticky xl:top-24 xl:h-fit">
                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-white" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                                    Course Content
                                </h2>
                                <p className="mt-1 text-sm text-brand-textSecondary">{lessons.length} lessons</p>
                            </div>
                            <BookOpen className="h-5 w-5 text-[#a78bfa]" />
                        </div>

                        <div className="flex flex-col gap-5">
                            {Object.entries(chapterGroups).map(([chapter, chapterLessons]) => (
                                <div key={chapter}>
                                    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-brand-textSecondary">
                                        {chapter}
                                    </p>
                                    <div className="flex flex-col gap-2">
                                        {chapterLessons.map((lesson) => {
                                            const isActive = lesson.id === activeLesson.id;
                                            const isCompleted = completedLessons.has(lesson.id);

                                            return (
                                                <button
                                                    key={lesson.id}
                                                    type="button"
                                                    onClick={() => setActiveLessonId(lesson.id)}
                                                    className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition ${isActive
                                                            ? "border-brand-accent/60 bg-brand-accent/10"
                                                            : "border-brand-accent/10 bg-brand-light/50 hover:border-brand-accent/40"
                                                        }`}
                                                >
                                                    <span className="mt-0.5 text-[#a78bfa]">
                                                        {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                                                    </span>
                                                    <span className="min-w-0 flex-1">
                                                        <span className="block text-sm font-semibold text-white">{lesson.title}</span>
                                                        <span className="mt-1 flex items-center gap-1 text-xs text-brand-textSecondary">
                                                            <Clock className="h-3.5 w-3.5" />
                                                            {lesson.duration}
                                                        </span>
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </aside>
                </div>
            </main>

            <HeroFooter />
        </div>
    );
}
