import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    BarChart3,
    Camera,
    Play,
    Video,
    AlertCircle,
    RefreshCcw,
    LayoutGrid
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const Analyser = () => {
    const navigate = useNavigate();
    const [activeSource, setActiveSource] = useState<string | null>(null);
    const [availableVideos, setAvailableVideos] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isWebcamActive, setIsWebcamActive] = useState(false);

    const BACKEND_URL = "http://localhost:8000";

    useEffect(() => {
        // Fetch available videos from the backend
        fetch(`${BACKEND_URL}/videos`)
            .then(res => res.json())
            .then(data => setAvailableVideos(data))
            .catch(() => setError("Backend not reachable. Run: python backend/main.py"));
    }, []);

    const startStream = (source: string) => {
        setError(null);
        if (source === "webcam") {
            setIsWebcamActive(true);
            setActiveSource(`${BACKEND_URL}/video_feed?source=webcam&t=${Date.now()}`);
        } else {
            setIsWebcamActive(false);
            setActiveSource(`${BACKEND_URL}/video_feed?source=${source}&t=${Date.now()}`);
        }
    };

    const stopStream = () => {
        setActiveSource(null);
        setIsWebcamActive(false);
    };

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
                        onClick={() => {
                            stopStream();
                            navigate("/");
                        }}
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Menu
                    </Button>
                </div>

                {error && (
                    <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive rounded-2xl animate-in fade-in slide-in-from-top-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle className="font-bold">Setup Required</AlertTitle>
                        <AlertDescription className="font-medium opacity-90">
                            {error}
                        </AlertDescription>
                    </Alert>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                    {/* Main Feed Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
                            <Card className="relative bg-black border-white/10 rounded-3xl overflow-hidden shadow-2xl min-h-[500px] flex flex-col">
                                <CardHeader className="p-6 border-b border-white/5 bg-white/[0.02]">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-white/50 flex items-center gap-2">
                                            <Radio className={cn("w-4 h-4", activeSource ? "text-primary animate-pulse" : "text-white/20")} />
                                            {isWebcamActive ? "Live Webcam Feed" : activeSource ? "Processing Video Stream" : "Global Visual Engine"}
                                        </CardTitle>
                                        {activeSource && (
                                            <Button size="sm" variant="destructive" onClick={stopStream} className="rounded-full h-8 px-4 font-bold text-[10px] uppercase">
                                                Terminate Session
                                            </Button>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0 flex-1 flex items-center justify-center bg-[#050505] relative min-h-[300px]">
                                    {activeSource ? (
                                        <img
                                            src={activeSource}
                                            alt="Detection Stream"
                                            className="max-w-full h-full object-contain mix-blend-screen"
                                            onError={() => setError("Stream connection lost. Is the backend running?")}
                                        />
                                    ) : (
                                        <div className="text-center space-y-4 p-12">
                                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                                                <Play className="w-8 h-8 text-white/30" />
                                            </div>
                                            <h3 className="text-xl font-bold text-white/70">Engine Idle</h3>
                                            <p className="text-muted-foreground max-w-xs mx-auto text-sm leading-relaxed">
                                                Select an example video or activate your webcam to initiate the YOLOv8 visual processing engine.
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex gap-4">
                            <Button
                                onClick={() => startStream("webcam")}
                                disabled={isWebcamActive}
                                className={cn(
                                    "flex-1 h-14 gap-3 bg-white text-black hover:bg-white/90 font-bold rounded-2xl transition-all shadow-xl shadow-white/5",
                                    isWebcamActive && "bg-primary text-white border-none shadow-primary/20"
                                )}
                            >
                                <Camera className="w-5 h-5" />
                                {isWebcamActive ? "Webcam Active" : "Run Live Webcam"}
                            </Button>
                        </div>
                    </div>

                    {/* Sidebar - Video Stacks */}
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
                                {availableVideos.length > 0 ? (
                                    availableVideos.map((video) => (
                                        <div
                                            key={video}
                                            onClick={() => startStream(video)}
                                            className={cn(
                                                "group p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between",
                                                activeSource?.includes(video)
                                                    ? "bg-primary/20 border-primary/50"
                                                    : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20"
                                            )}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 bg-white/5 rounded-xl group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                                                    <Video className="w-4 h-4" />
                                                </div>
                                                <span className="text-sm font-bold truncate max-w-[140px]">{video}</span>
                                            </div>
                                            <Play className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity translate-x-1 group-hover:translate-x-0" />
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-10 opacity-40">
                                        <Video className="w-8 h-8 mx-auto mb-3" />
                                        <p className="text-xs font-medium">Place videos in <br /> <code className="bg-white/10 p-1 rounded">public/videos</code></p>
                                    </div>
                                )}

                                <div className="pt-4 mt-6 border-t border-white/5">
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

                        {/* System Info */}
                        <Card className="bg-primary/5 border-primary/10 rounded-3xl overflow-hidden hidden md:block">
                            <CardContent className="p-6 space-y-4">
                                <h4 className="text-xs font-bold uppercase tracking-tighter text-primary">Engine Specs</h4>
                                <div className="space-y-3">
                                    {[
                                        { label: "Model", value: "YOLOv8l (Large)" },
                                        { label: "Inference", value: "GPU Accelerated" },
                                        { label: "Resolution", value: "1280x960" },
                                        { label: "Precision", value: "FP16" }
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

// Dummy Radio icon for types
const Radio = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" /><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.4" /><circle cx="12" cy="12" r="2" /><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.4" /><path d="M19.1 4.9C23 8.8 23 15.2 19.1 19.1" />
    </svg>
);
