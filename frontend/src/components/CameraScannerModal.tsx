import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RotateCcw } from 'lucide-react';
import ModalPortal from './ModalPortal';

interface CameraScannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCapture: (base64Image: string, mimeType: string) => void;
}

export default function CameraScannerModal({ isOpen, onClose, onCapture }: CameraScannerModalProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string>('');
    const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

    useEffect(() => {
        if (!isOpen) {
            stopCamera();
            return;
        }
        startCamera();

        return () => stopCamera();
    }, [isOpen, facingMode]);

    const startCamera = async () => {
        stopCamera();
        setError('');
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode }
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err: any) {
            setError('Could not access camera. Please allow permissions.');
            console.error(err);
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const handleCapture = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            // Get base64
            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);

            // Extract mimetype and base64
            const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
            if (matches) {
                onCapture(matches[2], matches[1]);
            }
            onClose();
        }
    };

    const toggleCamera = () => {
        setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
    };

    if (!isOpen) return null;

    return (
        <ModalPortal>
            <div className="fixed inset-0 bg-background/80 z-100 flex items-center justify-center p-4">
                <div className="bg-card rounded-2xl border border-border w-full max-w-md overflow-hidden flex flex-col items-center">
                    <div className="w-full flex items-center justify-between p-4 border-b border-border">
                        <h3 className="text-foreground font-bold tracking-wide">Scan Product Image</h3>
                        <button onClick={onClose} className="p-2 bg-muted hover:bg-muted/80 rounded-full text-muted-foreground hover:text-foreground transition-all">
                            <X size={18} />
                        </button>
                    </div>

                    <div className="relative w-full aspect-4/3 bg-black overflow-hidden flex items-center justify-center">
                        {error ? (
                            <div className="text-destructive text-sm p-6 text-center">
                                {error}
                            </div>
                        ) : (
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                className="w-full h-full object-cover"
                            />
                        )}
                        <canvas ref={canvasRef} className="hidden" />

                        {/* Scanning Box overlay */}
                        {!error && (
                            <div className="absolute inset-0 border-[6px] border-indigo-500/30 m-8 rounded-2xl pointer-events-none"></div>
                        )}
                    </div>

                    <div className="w-full p-6 flex items-center justify-center gap-6">
                        <button
                            onClick={toggleCamera}
                            className="p-3 bg-muted hover:bg-muted/80 rounded-full text-foreground transition-all"
                            title="Flip Camera"
                        >
                            <RotateCcw size={20} />
                        </button>

                        <button
                            onClick={handleCapture}
                            disabled={!!error}
                            className="w-16 h-16 rounded-full bg-indigo-500 hover:bg-indigo-400 border-4 border-indigo-500/30 flex items-center justify-center text-white transition-all disabled:opacity-50"
                        >
                            <Camera size={24} fill="currentColor" />
                        </button>

                        <div className="w-[44px]"></div>
                    </div>
                </div>
            </div>
        </ModalPortal>
    );
}
