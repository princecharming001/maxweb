"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/max/ui";
import { Icon } from "@/components/max/icons";

// Verbatim from iOS FaceScanScreen STEPS.
const STEPS = [
  { key: "front", label: "Front", hint: "Straight on, neutral expression." },
  { key: "left", label: "Left profile", hint: "Left cheek toward camera, ~90°." },
  { key: "right", label: "Right profile", hint: "Right cheek toward camera, ~90°." },
] as const;

export interface Captured {
  front: Blob;
  left: Blob;
  right: Blob;
}

type CamState = "starting" | "live" | "denied" | "unavailable";

export default function CameraCapture({
  onComplete,
  submitting,
}: {
  onComplete: (c: Captured) => void;
  submitting?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [stepIdx, setStepIdx] = useState(0);
  const [blobs, setBlobs] = useState<Partial<Record<string, Blob>>>({});
  const [previews, setPreviews] = useState<Partial<Record<string, string>>>({});
  const [cam, setCam] = useState<CamState>("starting");

  const step = STEPS[stepIdx];
  const allCaptured = !!(blobs.front && blobs.left && blobs.right);

  // Request the camera on mount. The <video> is ALWAYS mounted (below), so the
  // ref is stable — but attach happens in the effect below keyed on the stream.
  useEffect(() => {
    let active = true;
    if (!navigator.mediaDevices?.getUserMedia) {
      setCam("unavailable");
      return;
    }
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 1280 },
          },
          audio: false,
        });
        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        setCam("live");
      } catch (err) {
        const name = (err as DOMException)?.name;
        // Permission denied is recoverable (upload); no-camera / insecure
        // context is not — jump straight to the upload fallback.
        setCam(name === "NotAllowedError" || name === "SecurityError" ? "denied" : "unavailable");
      }
    })();
    return () => {
      active = false;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []);

  // Attach the stream to the (already-mounted) <video> once we have both.
  useEffect(() => {
    const v = videoRef.current;
    if (cam === "live" && v && streamRef.current && v.srcObject !== streamRef.current) {
      v.srcObject = streamRef.current;
      v.play().catch(() => undefined);
    }
  }, [cam, allCaptured]);

  const finish = useCallback(
    (next: Partial<Record<string, Blob>>) => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      onComplete({ front: next.front!, left: next.left!, right: next.right! });
    },
    [onComplete],
  );

  function acceptBlob(blob: Blob) {
    const key = step.key;
    const url = URL.createObjectURL(blob);
    const next = { ...blobs, [key]: blob };
    setBlobs(next);
    setPreviews((p) => ({ ...p, [key]: url }));
    if (stepIdx < STEPS.length - 1) setStepIdx(stepIdx + 1);
    else if (next.front && next.left && next.right) finish(next);
  }

  function captureFromVideo() {
    const video = videoRef.current;
    // Guard: an unattached/not-ready video reports 0 — never emit a blank frame.
    if (!video || !video.videoWidth || !video.videoHeight) {
      setCam("denied");
      return;
    }
    const size = Math.min(video.videoWidth, video.videoHeight);
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const sx = (video.videoWidth - size) / 2;
    const sy = (video.videoHeight - size) / 2;
    // Mirror the front-camera capture so the saved photo matches the mirrored
    // preview (parity with iOS `mirror={facing==='front'}`).
    ctx.translate(size, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size);
    canvas.toBlob((blob) => blob && acceptBlob(blob), "image/jpeg", 0.85);
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) acceptBlob(file);
    if (fileRef.current) fileRef.current.value = "";
  }

  const showVideo = cam === "live" && !allCaptured;
  const errorCopy =
    cam === "denied"
      ? "Camera access is off. Allow it in your browser, or upload a photo instead."
      : cam === "unavailable"
        ? "No camera here — upload a photo instead. (Live capture needs an https or localhost page.)"
        : "Starting camera…";

  return (
    <div>
      <div className="mb-4 flex items-center justify-center gap-2">
        {STEPS.map((s, i) => (
          <span
            key={s.key}
            className={`size-2 rounded-full ${
              blobs[s.key] ? "bg-mx-success" : i === stepIdx ? "bg-mx-accent" : "bg-mx-border-light"
            }`}
          />
        ))}
      </div>

      <div className="bg-mx-ink relative mx-auto aspect-square w-full max-w-[420px] overflow-hidden rounded-mx-2xl">
        {/* Video is ALWAYS mounted so its ref is stable; hidden when not live. */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`size-full -scale-x-100 object-cover ${showVideo ? "" : "hidden"}`}
        />
        {showVideo ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-[70%] w-[52%] rounded-[50%] border-2 border-white/70" />
          </div>
        ) : previews[step.key] && !allCaptured ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previews[step.key]} alt="" className="size-full object-cover" />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-3 text-center text-white/80">
            <Icon name="scan" className="size-10" />
            <p className="max-w-[280px] px-4 text-[13px]">{allCaptured ? "" : errorCopy}</p>
          </div>
        )}
      </div>

      {!allCaptured ? (
        <>
          <div className="mt-5 text-center">
            <div className="text-mx-ink text-[18px] font-semibold">{step.label}</div>
            <div className="text-mx-muted mt-1 text-[14px]">{step.hint}</div>
          </div>

          <div className="mt-5 flex flex-col items-center gap-3">
            {cam === "live" ? (
              <Button variant="accent" size="lg" onClick={captureFromVideo}>
                Capture {step.label.toLowerCase()}
              </Button>
            ) : cam === "starting" ? (
              <span className="text-mx-muted text-[13px]">Starting camera…</span>
            ) : null}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
            <button
              onClick={() => fileRef.current?.click()}
              className="text-mx-muted hover:text-mx-ink text-[13px] underline"
            >
              Upload a photo instead
            </button>
          </div>
        </>
      ) : (
        <div className="mt-5 text-center">
          <p className="text-mx-muted text-[14px]">
            {submitting ? "Uploading your scan…" : "All set."}
          </p>
        </div>
      )}
    </div>
  );
}
