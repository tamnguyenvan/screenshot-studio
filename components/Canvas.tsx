import React, { useState, useEffect, useRef } from 'react';
import { EditorSettings } from '../types';

interface CanvasProps {
    settings: EditorSettings;
    image: string | null;
    onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onFileDrop: (file: File) => void;
    exportRef: React.RefObject<HTMLDivElement>;
}

const Canvas: React.FC<CanvasProps> = ({ settings, image, onUpload, onFileDrop, exportRef }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [previewScale, setPreviewScale] = useState(1);
    const [isDragging, setIsDragging] = useState(false);

    // Calculate scale to fit the 1200px canvas into the visible area
    useEffect(() => {
        const calculateScale = () => {
            if (!containerRef.current) return;
            
            const { clientWidth, clientHeight } = containerRef.current;
            const padding = 60; // Spacing around the preview
            const availableWidth = clientWidth - padding;
            const availableHeight = clientHeight - padding;
            
            // The canvas logic uses a fixed base width for export consistency
            const baseWidth = 1200;
            
            // Calculate base height based on aspect ratio
            const [w, h] = settings.aspectRatio.split('/').map(Number);
            const baseHeight = baseWidth * (h / w);

            const scaleX = availableWidth / baseWidth;
            const scaleY = availableHeight / baseHeight;
            
            // Fit within the container
            setPreviewScale(Math.min(1, scaleX, scaleY));
        };

        calculateScale();
        window.addEventListener('resize', calculateScale);
        return () => window.removeEventListener('resize', calculateScale);
    }, [settings.aspectRatio, image]);
    
    const getShadowClass = (size: string) => {
        switch (size) {
            case 'sm': return 'shadow-lg shadow-black/20';
            case 'md': return 'shadow-xl shadow-black/30';
            case 'lg': return 'shadow-2xl shadow-black/40';
            case 'xl': return 'shadow-[0_20px_50px_rgba(0,0,0,0.5)]';
            case '2xl': return 'shadow-[0_25px_60px_rgba(0,0,0,0.6)]';
            case 'none': return '';
            default: return '';
        }
    };

    // Background Style Generator
    const getBackgroundStyle = () => {
        const { type, solid, gradient, image, blur } = settings.background;
        
        const baseStyle: React.CSSProperties = {};

        if (type === 'solid') {
            baseStyle.backgroundColor = solid;
        } else if (type === 'gradient') {
            baseStyle.backgroundImage = `linear-gradient(${gradient.direction}, ${gradient.start}, ${gradient.end})`;
        } else if (type === 'wallpaper' || type === 'image') {
            baseStyle.backgroundImage = `url(${image})`;
            baseStyle.backgroundSize = 'cover';
            baseStyle.backgroundPosition = 'center';
            
            if (blur > 0) {
                baseStyle.filter = `blur(${blur}px)`;
                // Scale up slightly to prevent blurred edges from showing white background
                baseStyle.transform = 'scale(1.05)'; 
            }
        } else {
            baseStyle.backgroundColor = '#000';
        }

        return baseStyle;
    };

    // Calculate constraints for pixel-perfect fitting
    const [aspectW, aspectH] = settings.aspectRatio.split('/').map(Number);
    const baseWidth = 1200;
    const baseHeight = baseWidth * (aspectH / aspectW);
    
    const padding = settings.padding;
    const headerHeight = 32;
    
    // Constraints ensures image fits inside padding
    // We clamp height calculation to 0 to prevent negative values on extreme padding
    const maxImgWidth = baseWidth - (padding * 2);
    const maxImgHeight = Math.max(0, baseHeight - (padding * 2) - headerHeight);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onFileDrop(e.dataTransfer.files[0]);
        }
    };

    return (
        <div 
            ref={containerRef} 
            className="flex-1 relative bg-[#050505] overflow-hidden flex flex-col items-center justify-center p-4"
            onDragOver={handleDragOver}
        >
            {/* Drag Overlay */}
            {isDragging && (
                <div 
                    className="absolute inset-0 z-50 bg-blue-600/20 border-4 border-blue-500 backdrop-blur-sm flex items-center justify-center transition-all"
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                >
                    <div className="pointer-events-none text-2xl font-bold text-white bg-black/50 px-6 py-3 rounded-xl backdrop-blur-md shadow-xl">
                        Drop Image Here
                    </div>
                </div>
            )}
            
            {/* Dot Grid Background */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" 
                 style={{ 
                     backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', 
                     backgroundSize: '20px 20px' 
                 }}>
            </div>

            {/* Canvas Container */}
            <div className="relative z-10 transition-transform duration-200 ease-out"
                 style={{
                     transform: `scale(${previewScale})`,
                     transformOrigin: 'center'
                 }}
            >
                {image ? (
                    <div 
                        ref={exportRef}
                        className="relative flex items-center justify-center overflow-hidden"
                        style={{
                            width: `${baseWidth}px`,
                            height: `${baseHeight}px`,
                            padding: `${padding}px`,
                            boxSizing: 'border-box',
                        }}
                    >
                        {/* Background Layer */}
                        <div 
                            className="absolute inset-0 z-0"
                            style={getBackgroundStyle()}
                        />

                        {/* Window Wrapper */}
                        <div 
                            className={`relative z-10 flex flex-col ${getShadowClass(settings.shadow.size)}`}
                            style={{
                                // Size is driven by content (Image + Header) to avoid black bars
                                borderRadius: `${settings.borderRadius}px`,
                                transform: `scale(${settings.scale})`,
                                backgroundColor: settings.darkModeWindow ? '#1e1e20' : '#ffffff',
                                maxWidth: '100%',
                                maxHeight: '100%'
                            }}
                        >
                            {/* Window Header */}
                            <div className={`h-[32px] min-h-[32px] flex-shrink-0 flex items-center px-4 space-x-2 ${settings.darkModeWindow ? 'bg-[#2a2a2c]' : 'bg-[#f0f0f0]'} rounded-t-[inherit]`} 
                                 style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0, width: '100%' }}>
                                <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                                <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                            </div>
                            
                            {/* Image Container */}
                            <div className="relative w-full flex items-center justify-center bg-inherit rounded-b-[inherit] overflow-hidden">
                                <img 
                                    src={image} 
                                    alt="Screenshot" 
                                    style={{
                                        display: 'block',
                                        maxWidth: `${maxImgWidth}px`,
                                        maxHeight: `${maxImgHeight}px`,
                                        width: 'auto',
                                        height: 'auto'
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    // Empty State / Uploader
                    <label className="cursor-pointer group relative flex flex-col items-center justify-center w-[600px] h-[400px] border-2 border-dashed border-gray-700 rounded-2xl bg-[#0a0a0a] hover:border-gray-500 hover:bg-[#111] transition-all">
                        <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-200 mb-2">Upload Screenshot</h3>
                        <p className="text-sm text-gray-500">Drag & drop or click to browse<br/>(or paste from clipboard)</p>
                        <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*" 
                            onChange={onUpload}
                        />
                    </label>
                )}
            </div>

            {/* Reset Button */}
            {image && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50">
                   <button 
                        onClick={() => onUpload({ target: { value: '' } } as any)} 
                        className="px-6 py-2 bg-[#111] border border-[#333] rounded-full text-xs text-gray-400 hover:text-white hover:border-gray-500 transition-all shadow-lg"
                   >
                       Reset Image
                   </button>
                </div>
            )}
        </div>
    );
};

export default Canvas;