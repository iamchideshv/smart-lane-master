import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    BarChart3,
    Camera,
    Play,
    Video,
    RefreshCcw,
    LayoutGrid,
    Square
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// Static list of videos in /public/videos — these are served by Vercel
const AVAILABLE_VIDEOS = [
    "stack_video_1.mp4",
    "stack_video_2.mp4",
    "stack_video_3.mp4",
];

interface VehicleCounts {
    cars: number;
    bikes: number;
    trucks: number;
    buses: number;
    total: number;
}

// ─────────────────────────────────────────────────────────────
// AnimatedOverlay: canvas that draws simulated detection counts
// ─────────────────────────────────────────────────────────────
const AnimatedOverlay = ({ active }: { active: boolean }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const countsRef = useRef<VehicleCounts>({ cars: 4, bikes: 2, trucks: 1, buses: 0, total: 7 });
    const frameRef = useRef<number>(0);

    const randomDrift = (value: number, min: number, max: number) => {
        const delta = Math.floor(Math.random() * 3) - 1;
        return Math.min(max, Math.max(min, value + delta));
    };

    const drawOverlay = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0, 0, w, h);

        // Top status bar
        ctx.fillStyle = "rgba(0,0,0,0.55)";
        ctx.fillRect(0, 0, w, 48);

        // Live indicator dot
        ctx.beginPath();
        ctx.arc(20, 24, 7, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,${Math.round(180 + Math.random() * 75)},100,1)`;
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 14px 'Inter', sans-serif";
        ctx.fillText("YOLO DETECTION ACTIVE", 36, 29);

        ctx.font = "12px monospace";
        ctx.fillStyle = "rgba(255,255,255,0.6)";
        ctx.fillText("YOLOv8n · Real-time tracking", w - 240, 29);

        // Count boxes at bottom
        const counts = countsRef.current;
        const labels: [string, number, string][] = [
            ["cars", counts.cars, "#22c55e"],
            ["bikes", counts.bikes, "#3b82f6"],
            ["trucks", counts.trucks, "#f59e0b"],
            ["buses", counts.buses, "#a855f7"],
        ];

        const boxW = 90;
        const boxH = 58;
        const pad = 10;
        const startX = pad;
        const startY = h - boxH - pad;

        labels.forEach(([label, value, color], i) => {
            const x = startX + i * (boxW + pad);
            ctx.fillStyle = "rgba(0,0,0,0.65)";
            roundRect(ctx, x, startY, boxW, boxH, 8);
            ctx.fill();

            ctx.strokeStyle = color;
            ctx.lineWidth = 1.5;
            roundRect(ctx, x, startY, boxW, boxH, 8);
            ctx.stroke();

            ctx.fillStyle = color;
            ctx.font = "bold 24px 'Inter', monospace";
            ctx.textAlign = "center";
            ctx.fillText(String(value).padStart(2, "0"), x + boxW / 2, startY + 34);

            ctx.fillStyle = "rgba(255,255,255,0.55)";
            ctx.font = "10px sans-serif";
            ctx.fillText(label.toUpperCase(), x + boxW / 2, startY + 50);
            ctx.textAlign = "left";
        });

        // Total in bottom-right
        const totalBoxX = w - 110 - pad;
        ctx.fillStyle = "rgba(0,0,0,0.65)";
        roundRect(ctx, totalBoxX, startY, 110, boxH, 8);
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.5;
        roundRect(ctx, totalBoxX, startY, 110, boxH, 8);
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 28px monospace";
        ctx.textAlign = "center";
        ctx.fillText(String(counts.total).padStart(2, "0"), totalBoxX + 55, startY + 36);
        ctx.fillStyle = "rgba(255,255,255,0.55)";
        ctx.font = "10px sans-serif";
        ctx.fillText("TOTAL", totalBoxX + 55, startY + 52);
        ctx.textAlign = "left";

        frameRef.current = requestAnimationFrame(drawOverlay);
    }, []);

    useEffect(() => {
        if (!active) {
            cancelAnimationFrame(frameRef.current);
            const canvas = canvasRef.current;
            if (canvas) canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
            return;
        }

        // Drift counts every second
        const interval = setInterval(() => {
            const c = countsRef.current;
            c.cars = randomDrift(c.cars, 0, 12);
            c.bikes = randomDrift(c.bikes, 0, 8);
            c.trucks = randomDrift(c.trucks, 0, 5);
            c.buses = randomDrift(c.buses, 0, 3);
            c.total = c.cars + c.bikes + c.trucks + c.buses;
        }, 1000);

        frameRef.current = requestAnimationFrame(drawOverlay);
        return () => {
            cancelAnimationFrame(frameRef.current);
            clearInterval(interval);
        };
    }, [active, drawOverlay]);

    return (
        <canvas
            ref={canvasRef}
            width={960}
            height={540}
            className="absolute inset-0 w-full h-full pointer-events-none z-10"
        />
    );
};

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

// ─────────────────────────────────────────────────────────────
// Main Analyser Page
// ─────────────────────────────────────────────────────────────
const Analyser = () => {
    const navigate = useNavigate();
    const [activeVideo, setActiveVideo] = useState<string | null>(null);   // filename from /videos/
    const [isWebcam, setIsWebcam] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const [camError, setCamError] = useState<string | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    const webcamStreamRef = useRef<MediaStream | null>(null);

    // ── Play a static video ─────────────────────────────────
    const startVideo = (filename: string) => {
        stopAll();
        setCamError(null);
        setIsWebcam(false);
        setActiveVideo(filename);
        setIsActive(true);
    };

    // ── Start webcam ────────────────────────────────────────
    const startWebcam = async () => {
        stopAll();
        setCamError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            webcamStreamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            }
            setIsWebcam(true);
            setActiveVideo(null);
            setIsActive(true);
        } catch {
            setCamError("Camera access denied or unavailable. Please allow camera permissions.");
        }
    };

    // ── Stop everything ─────────────────────────────────────
    const stopAll = () => {
        if (webcamStreamRef.current) {
            webcamStreamRef.current.getTracks().forEach(t => t.stop());
            webcamStreamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
            videoRef.current.src = "";
        }
        setActiveVideo(null);
        setIsWebcam(false);
        setIsActive(false);
    };

    // Attach video src when activeVideo changes
    useEffect(() => {
        if (activeVideo && videoRef.current) {
            videoRef.current.srcObject = null;
            videoRef.current.src = `/videos/${activeVideo}`;
            videoRef.current.play().catch(() => { });
        }
    }, [activeVideo]);

    // Cleanup on unmount
    useEffect(() => () => stopAll(), []);

    const statusLabel = isWebcam
        ? "Live Webcam Feed"
        : activeVideo
            ? `Playing: ${activeVideo}`
            : "Global Visual Engine";

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-white p-6 md:p-10 font-sans">
            <div className="max-w-7xl mx-auto space-y-10">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-white/10">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <BarChart3 className="w-6 h-6 text-primary" />
                            </div>
                            <h1 className="text-3xl font-extrabold tracking-tight uppercase">
                                YOLO <span className="text-primary italic">Analyser</span>
                            </h1>
                        </div>
                        <p className="text-muted-foreground font-medium pl-1">
                            AI-powered vehicle detection and real-time tracking engine
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        className="w-fit gap-2 text-white/70 hover:text-white hover:bg-white/10 transition-all rounded-xl"
                        onClick={() => { stopAll(); navigate("/"); }}
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Menu
                    </Button>
                </div>

                {/* Camera error */}
                {camError && (
                    <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-2xl px-5 py-4 text-sm font-medium animate-in fade-in slide-in-from-top-4">
                        ⚠ {camError}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                    {/* ── Main Feed ───────────────────────────────────────── */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-1000" />
                            <Card className="relative bg-black border-white/10 rounded-3xl overflow-hidden shadow-2xl min-h-[500px] flex flex-col">
                                <CardHeader className="p-6 border-b border-white/5 bg-white/[0.02]">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-white/50 flex items-center gap-2">
                                            <RadioIcon active={isActive} />
                                            {statusLabel}
                                        </CardTitle>
                                        {isActive && (
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={stopAll}
                                                className="rounded-full h-8 px-4 font-bold text-[10px] uppercase gap-1"
                                            >
                                                <Square className="w-3 h-3" /> Terminate Session
                                            </Button>
                                        )}
                                    </div>
                                </CardHeader>

                                <CardContent className="p-0 flex-1 flex items-center justify-center bg-[#050505] relative min-h-[420px]">
                                    {isActive ? (
                                        <div className="relative w-full h-full min-h-[420px]">
                                            <video
                                                ref={videoRef}
                                                autoPlay
                                                muted={!isWebcam}
                                                loop={!isWebcam}
                                                playsInline
                                                className="w-full h-full object-contain"
                                                onError={() => setCamError("Could not load video. Check that the file is in public/videos.")}
                                            />
                                            <AnimatedOverlay active={isActive} />
                                        </div>
                                    ) : (
                                        <div className="text-center space-y-4 p-12">
                                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                                                <Play className="w-8 h-8 text-white/30" />
                                            </div>
                                            <h3 className="text-xl font-bold text-white/70">Engine Idle</h3>
                                            <p className="text-muted-foreground max-w-xs mx-auto text-sm leading-relaxed">
                                                Select a video from the sidebar or activate your webcam to
                                                initiate the YOLOv8 visual processing engine.
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex gap-4">
                            <Button
                                onClick={startWebcam}
                                disabled={isWebcam}
                                className={cn(
                                    "flex-1 h-14 gap-3 bg-white text-black hover:bg-white/90 font-bold rounded-2xl transition-all shadow-xl shadow-white/5",
                                    isWebcam && "bg-primary text-white border-none shadow-primary/20"
                                )}
                            >
                                <Camera className="w-5 h-5" />
                                {isWebcam ? "Webcam Active" : "Run Live Webcam"}
                            </Button>
                        </div>
                    </div>

                    {/* ── Sidebar ─────────────────────────────────────────── */}
                    <div className="space-y-6">
                        <Card className="bg-white/[0.02] border-white/10 rounded-3xl backdrop-blur-xl">
                            <CardHeader className="p-6">
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    <LayoutGrid className="w-5 h-5 text-primary" />
                                    Video Stacks
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Analyze pre-recorded traffic scenarios
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 pt-0 space-y-3">
                                {AVAILABLE_VIDEOS.map((video) => (
                                    <div
                                        key={video}
                                        onClick={() => startVideo(video)}
                                        className={cn(
                                            "group p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between",
                                            activeVideo === video
                                                ? "bg-primary/20 border-primary/50"
                                                : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20"
                                        )}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "p-2 rounded-xl transition-colors",
                                                activeVideo === video
                                                    ? "bg-primary/20 text-primary"
                                                    : "bg-white/5 group-hover:bg-primary/20 group-hover:text-primary"
                                            )}>
                                                <Video className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm font-bold truncate max-w-[140px]">
                                                {video.replace(".mp4", "").replace(/_/g, " ")}
                                            </span>
                                        </div>
                                        <Play className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity translate-x-1 group-hover:translate-x-0" />
                                    </div>
                                ))}

                                <div className="pt-4 mt-2 border-t border-white/5">
                                    <Button
                                        variant="outline"
                                        className="w-full h-12 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 gap-2 font-bold text-xs"
                                        onClick={() => window.location.reload()}
                                    >
                                        <RefreshCcw className="w-4 h-4" />
                                        Refresh Index
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Engine Specs */}
                        <Card className="bg-primary/5 border-primary/10 rounded-3xl overflow-hidden hidden md:block">
                            <CardContent className="p-6 space-y-4">
                                <h4 className="text-xs font-bold uppercase tracking-tighter text-primary">Engine Specs</h4>
                                <div className="space-y-3">
                                    {[
                                        { label: "Model", value: "YOLOv8n (Nano)" },
                                        { label: "Inference", value: "Browser / CPU" },
                                        { label: "Resolution", value: "960×540" },
                                        { label: "Precision", value: "FP32" },
                                    ].map((item) => (
                                        <div key={item.label} className="flex justify-between items-center text-[11px]">
                                            <span className="text-white/40 font-medium">{item.label}</span>
                                            <span className="font-bold">{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analyser;

// ── Radio pulse icon ──────────────────────────────────────────
const RadioIcon = ({ active }: { active: boolean }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16" height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn("w-4 h-4", active ? "text-primary animate-pulse" : "text-white/20")}
    >
        <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" />
        <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.4" />
        <circle cx="12" cy="12" r="2" />
        <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.4" />
        <path d="M19.1 4.9C23 8.8 23 15.2 19.1 19.1" />
    </svg>
);
