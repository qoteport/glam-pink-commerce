import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ZoomOut, RotateCcw, Maximize } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ImageZoomDialogProps {
    imageSrc: string;
    altText: string;
    trigger?: React.ReactNode;
    isOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
}

const ImageZoomDialog: React.FC<ImageZoomDialogProps> = ({
    imageSrc,
    altText,
    trigger,
    isOpen: externalIsOpen,
    onOpenChange: externalOnOpenChange,
}) => {
    const [internalIsOpen, setInternalIsOpen] = useState(false);
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    const isControlled = externalIsOpen !== undefined;
    const isOpen = isControlled ? externalIsOpen : internalIsOpen;
    const setIsOpen = (open: boolean) => {
        if (!isControlled) {
            setInternalIsOpen(open);
        }
        externalOnOpenChange?.(open);
    };

    const handleZoomIn = () => {
        setScale((prev) => Math.min(prev + 0.5, 4));
    };

    const handleZoomOut = () => {
        setScale((prev) => Math.max(prev - 0.5, 1));
    };

    const handleReset = () => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
    };

    // Reset state when dialog closes
    useEffect(() => {
        if (!isOpen) {
            // Small delay to allow exit animation to start before resetting
            const timer = setTimeout(() => {
                handleReset();
            }, 200);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    // Handle wheel zoom
    const handleWheel = (e: React.WheelEvent) => {
        e.stopPropagation();
        if (e.deltaY < 0) {
            handleZoomIn();
        } else {
            handleZoomOut();
        }
    };

    // Update position limits based on scale
    // This is a simple implementation; complex constraints might require more math
    // For now, we rely on the users ability to drag it back if they lose it (reset button helps)

    return (
        <Dialog open={isOpen}  onOpenChange={setIsOpen} >
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent showCloseButton={false} className="md:max-w-[95vw] w-full h-[100vh] md:h-[90vh] p-1 border-none bg-black/90 text-white overflow-hidden focus:outline-none">

                {/* Controls Overlay */}
                <div className="absolute top-4 right-4 z-50 flex flex-col gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full bg-black/50 hover:bg-black/70 text-white border border-white/20"
                        onClick={() => setIsOpen(false)}
                    >
                        <X size={20} />
                    </Button>
                </div>

                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-50 flex gap-4 bg-black/50 backdrop-blur-sm p-2 rounded-full border border-white/10">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleZoomOut}
                        disabled={scale <= 1}
                        className="text-white hover:bg-white/20 rounded-full w-10 h-10"
                    >
                        <ZoomOut size={20} />
                    </Button>

                    <div className="flex items-center justify-center min-w-[3rem] font-medium select-none">
                        {Math.round(scale * 100)}%
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleZoomIn}
                        disabled={scale >= 4}
                        className="text-white hover:bg-white/20 rounded-full w-10 h-10"
                    >
                        <ZoomIn size={20} />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleReset}
                        disabled={scale === 1 && position.x === 0 && position.y === 0}
                        className="text-white hover:bg-white/20 rounded-full w-10 h-10 ml-2 border-l border-white/20 pl-4 rounded-l-none"
                    >
                        <RotateCcw size={18} />
                    </Button>
                </div>

                {/* Image Container */}
                <div
                    className="w-full h-full flex items-center justify-center overflow-hidden cursor-move"
                    ref={containerRef}
                    onWheel={handleWheel}
                >
                    <motion.img
                        src={imageSrc}
                        alt={altText}
                        className="max-h-full max-w-full object-contain select-none"
                        drag={scale > 1}
                        dragConstraints={containerRef}
                        dragElastic={0.1}
                        dragMomentum={false} // Disable momentum to keep it controlled
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{
                            opacity: 1,
                            scale: scale,
                            x: position.x,
                            y: position.y
                        }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        onDragEnd={(e, info) => {
                            // If we want to save position, we can, but simpler to just let motion handle it visually
                            // Updating state here might fight with motion's internal state if not careful
                        }}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ImageZoomDialog;
