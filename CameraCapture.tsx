"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  onCapture: (dataUrl: string) => void;
};

export function CameraCapture({ onCapture }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasStream, setHasStream] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setHasStream(true);
        }
      } catch (err) {
        setError("Camera permission denied");
      }
    };

    startCamera();

    return () => {
      const tracks = (videoRef.current?.srcObject as MediaStream | null)?.getTracks();
      tracks?.forEach((track) => track.stop());
    };
  }, []);

  const captureImage = () => {
    if (!canvasRef.current || !videoRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    ctx.drawImage(videoRef.current, 0, 0);
    const dataUrl = canvasRef.current.toDataURL("image/png");
    onCapture(dataUrl);
  };

  return (
    <div className="rounded-3xl border border-dashed border-auwn-accent/50 bg-black/30 p-6 text-center">
      {hasStream ? (
        <video ref={videoRef} className="mx-auto h-60 w-full rounded-2xl object-cover" />
      ) : (
        <div className="flex h-60 items-center justify-center rounded-2xl bg-white/5 text-sm text-white/60">
          {error ?? "Requesting camera access"}
        </div>
      )}
      <button
        type="button"
        onClick={captureImage}
        className="mt-4 w-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-300 px-5 py-3 font-semibold text-black"
      >
        Capture Face
      </button>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
