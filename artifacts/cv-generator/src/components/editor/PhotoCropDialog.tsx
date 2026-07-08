import React, { useRef, useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface PhotoCropDialogProps {
  src: string;
  open: boolean;
  onClose: () => void;
  onApply: (croppedDataUrl: string) => void;
}

const CANVAS_SIZE = 320; // display canvas size (px)
const OUTPUT_SIZE = 400; // output image size (px)

export function PhotoCropDialog({ src, open, onClose, onApply }: PhotoCropDialogProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [imgNaturalSize, setImgNaturalSize] = useState({ w: 1, h: 1 });

  // Load image and center it when src changes
  useEffect(() => {
    if (!src || !open) return;
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      setImgNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
      // Compute initial scale to fill the circle
      const minDim = Math.min(img.naturalWidth, img.naturalHeight);
      const initialScale = CANVAS_SIZE / minDim;
      setScale(initialScale);
      setOffset({ x: 0, y: 0 });
    };
    img.src = src;
  }, [src, open]);

  // Draw on canvas whenever scale/offset/image changes
  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw image
    const drawW = img.naturalWidth * scale;
    const drawH = img.naturalHeight * scale;
    const x = CANVAS_SIZE / 2 - drawW / 2 + offset.x;
    const y = CANVAS_SIZE / 2 - drawH / 2 + offset.y;
    ctx.drawImage(img, x, y, drawW, drawH);

    // Draw dark overlay with circle cutout
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(CANVAS_SIZE / 2, CANVAS_SIZE / 2, CANVAS_SIZE / 2 - 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Draw circle border
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.8)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(CANVAS_SIZE / 2, CANVAS_SIZE / 2, CANVAS_SIZE / 2 - 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }, [scale, offset, imgNaturalSize]);

  // Mouse drag handlers
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
  }, []);

  const onMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  // Touch drag handlers
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    isDragging.current = true;
    lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const dx = e.touches[0].clientX - lastPos.current.x;
    const dy = e.touches[0].clientY - lastPos.current.y;
    lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
  }, []);

  const handleReset = () => {
    const img = imageRef.current;
    if (!img) return;
    const minDim = Math.min(img.naturalWidth, img.naturalHeight);
    setScale(CANVAS_SIZE / minDim);
    setOffset({ x: 0, y: 0 });
  };

  const handleApply = () => {
    const img = imageRef.current;
    if (!img) return;

    // Render to output canvas
    const outCanvas = document.createElement("canvas");
    outCanvas.width = OUTPUT_SIZE;
    outCanvas.height = OUTPUT_SIZE;
    const ctx = outCanvas.getContext("2d");
    if (!ctx) return;

    // Scale factor from display canvas to output canvas
    const ratio = OUTPUT_SIZE / CANVAS_SIZE;

    const drawW = img.naturalWidth * scale * ratio;
    const drawH = img.naturalHeight * scale * ratio;
    const x = OUTPUT_SIZE / 2 - drawW / 2 + offset.x * ratio;
    const y = OUTPUT_SIZE / 2 - drawH / 2 + offset.y * ratio;

    // Clip to circle
    ctx.beginPath();
    ctx.arc(OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(img, x, y, drawW, drawH);

    onApply(outCanvas.toDataURL("image/jpeg", 0.92));
  };

  const minScale = CANVAS_SIZE / Math.max(imgNaturalSize.w, imgNaturalSize.h);
  const maxScale = minScale * 4;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Ajustar foto de perfil</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-2">
          <p className="text-sm text-muted-foreground text-center">
            Arrastra para reposicionar. Usa el control para hacer zoom.
          </p>

          {/* Canvas */}
          <div
            className="rounded-full overflow-hidden cursor-grab active:cursor-grabbing select-none border-2 border-border"
            style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onMouseUp}
          >
            <canvas
              ref={canvasRef}
              width={CANVAS_SIZE}
              height={CANVAS_SIZE}
              style={{ display: "block" }}
            />
          </div>

          {/* Zoom controls */}
          <div className="w-full flex items-center gap-3 px-2">
            <button
              type="button"
              onClick={() => setScale(s => Math.max(minScale, s - minScale * 0.15))}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <Slider
              className="flex-1"
              min={minScale}
              max={maxScale}
              step={(maxScale - minScale) / 100}
              value={[scale]}
              onValueChange={([val]) => setScale(val)}
            />
            <button
              type="button"
              onClick={() => setScale(s => Math.min(maxScale, s + minScale * 0.15))}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restablecer posición
          </button>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleApply}>
            Aplicar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
