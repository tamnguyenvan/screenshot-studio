import React, { useState, useRef } from 'react';
import { EditorSettings, GradientDirection, BackgroundType, ExportFormat } from '../types';
import { generateSmartPalette } from '../services/geminiService';
import GithubButton from './GithubButton';

interface SidebarProps {
    settings: EditorSettings;
    updateSettings: (newSettings: Partial<EditorSettings>) => void;
    imageData: string | null;
    isAnalyzing: boolean;
    setIsAnalyzing: (val: boolean) => void;
    onDownload: () => void;
    onCopy: () => Promise<void>;
}

const wallpapers = [
    "/wallpapers/thumbnails/gradient-wallpaper-0001.jpg",
    "/wallpapers/thumbnails/gradient-wallpaper-0002.jpg",
    "/wallpapers/thumbnails/gradient-wallpaper-0003.jpg",
    "/wallpapers/thumbnails/gradient-wallpaper-0004.jpg",
    "/wallpapers/thumbnails/gradient-wallpaper-0005.jpg",
    "/wallpapers/thumbnails/gradient-wallpaper-0006.jpg",
    "/wallpapers/thumbnails/gradient-wallpaper-0007.jpg",
    "/wallpapers/thumbnails/gradient-wallpaper-0008.jpg",
    "/wallpapers/thumbnails/gradient-wallpaper-0009.jpg",
    "/wallpapers/thumbnails/gradient-wallpaper-0010.jpg",
    "/wallpapers/thumbnails/gradient-wallpaper-0011.jpg",
    "/wallpapers/thumbnails/gradient-wallpaper-0012.jpg"
];

const solidColors = [
    "#000000", "#1a1a1a", "#ffffff", "#f3f4f6",
    "#ef4444", "#f97316", "#f59e0b", "#84cc16",
    "#10b981", "#06b6d4", "#3b82f6", "#6366f1",
    "#8b5cf6", "#d946ef", "#f43f5e", "#881337"
];

const directions: { label: string, value: GradientDirection, rotate: string }[] = [
    { label: 'TL', value: 'to bottom right', rotate: 'rotate-[-45deg]' },
    { label: 'T', value: 'to bottom', rotate: 'rotate-0' },
    { label: 'TR', value: 'to bottom left', rotate: 'rotate-[45deg]' },
    { label: 'L', value: 'to right', rotate: 'rotate-[-90deg]' },
    { label: 'C', value: 'to right', rotate: 'opacity-0' },
    { label: 'R', value: 'to left', rotate: 'rotate-[90deg]' },
    { label: 'BL', value: 'to top right', rotate: 'rotate-[-135deg]' },
    { label: 'B', value: 'to top', rotate: 'rotate-[180deg]' },
    { label: 'BR', value: 'to top left', rotate: 'rotate-[135deg]' },
];

const Sidebar: React.FC<SidebarProps> = ({ 
    settings, 
    updateSettings, 
    imageData, 
    isAnalyzing, 
    setIsAnalyzing,
    onDownload,
    onCopy
}) => {
    const [dragActive, setDragActive] = useState(false);
    const [loadingWallpaper, setLoadingWallpaper] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isCopying, setIsCopying] = useState(false);

    const setBgType = (type: BackgroundType) => {
        updateSettings({ background: { ...settings.background, type } });
    };

    const handleCustomImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
    };

    const processFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            updateSettings({
                background: {
                    ...settings.background,
                    type: 'image',
                    image: event.target?.result as string
                }
            });
        };
        reader.readAsDataURL(file);
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    const selectWallpaper = async (wallpaper: string) => {
        setLoadingWallpaper(true);
        try {
            const hiResWallpaper = wallpaper.replace('thumbnails', 'hires');
            updateSettings({
                background: {
                    ...settings.background,
                    type: 'wallpaper',
                    image: hiResWallpaper
                }
            });
        } catch (e) {
            console.error("Failed to load wallpaper", e);
        } finally {
            setLoadingWallpaper(false);
        }
    };

    return (
        <div className="w-80 flex-shrink-0 bg-[#111111] border-l border-[#222] flex flex-col h-full overflow-hidden">
            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-8">
                {/* Social contacts */}
                <div>
                    <GithubButton />
                </div>
                
                {/* Background Section */}
                <div>
                    {/* Background Type Toggle */}
                    <div className="grid grid-cols-4 gap-1 bg-[#1f1f1f] p-1 rounded-lg mb-4">
                        {(['wallpaper', 'gradient', 'solid', 'image'] as BackgroundType[]).map(type => (
                            <button
                                key={type}
                                onClick={() => setBgType(type)}
                                className={`py-1 text-[10px] font-medium rounded-md capitalize transition-all text-center ${settings.background.type === type ? 'bg-[#333] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                    
                    {/* WALLPAPER GRID */}
                    {settings.background.type === 'wallpaper' && (
                        <div className="relative">
                            {loadingWallpaper && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10 rounded-lg">
                                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                </div>
                            )}
                            <div className="grid grid-cols-5 gap-2 max-h-28 overflow-y-auto p-1 custom-scrollbar">
                                {wallpapers.map((wallpaper, index) => (
                                    <button
                                        key={index}
                                        onClick={() => selectWallpaper(wallpaper)}
                                        className="aspect-square rounded-md overflow-hidden border border-transparent hover:border-gray-500 focus:ring-1 focus:ring-gray-500 transition-all relative group"
                                    >
                                        <img 
                                            src={wallpaper} 
                                            alt="Wallpaper" 
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* SOLID COLOR CONTROLS */}
                    {settings.background.type === 'solid' && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <input 
                                    type="color" 
                                    value={settings.background.solid}
                                    onChange={(e) => updateSettings({ background: { ...settings.background, solid: e.target.value } })}
                                    className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0"
                                />
                                <input 
                                    type="text" 
                                    value={settings.background.solid}
                                    onChange={(e) => updateSettings({ background: { ...settings.background, solid: e.target.value } })}
                                    className="flex-1 bg-[#1f1f1f] border border-[#333] rounded px-2 py-1.5 text-xs text-white font-mono uppercase"
                                />
                            </div>
                            <div className="grid grid-cols-8 gap-2">
                                {solidColors.map(c => (
                                    <button
                                        key={c}
                                        onClick={() => updateSettings({ background: { ...settings.background, solid: c } })}
                                        className={`w-full aspect-square rounded-md border border-transparent hover:border-gray-500 transition-all ${settings.background.solid === c ? 'ring-1 ring-white' : ''}`}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* GRADIENT CONTROLS */}
                    {settings.background.type === 'gradient' && (
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <div className="flex-1 space-y-1">
                                    <label className="text-[10px] text-gray-500 uppercase">Start</label>
                                    <div className="flex items-center gap-2 bg-[#1f1f1f] p-1 rounded border border-[#333]">
                                        <input 
                                            type="color" 
                                            value={settings.background.gradient.start}
                                            onChange={(e) => updateSettings({ 
                                                background: { 
                                                    ...settings.background, 
                                                    gradient: { ...settings.background.gradient, start: e.target.value } 
                                                } 
                                            })}
                                            className="w-6 h-6 rounded cursor-pointer bg-transparent border-0 p-0"
                                        />
                                        <span className="text-[10px] font-mono">{settings.background.gradient.start}</span>
                                    </div>
                                </div>
                                <div className="flex-1 space-y-1">
                                    <label className="text-[10px] text-gray-500 uppercase">End</label>
                                    <div className="flex items-center gap-2 bg-[#1f1f1f] p-1 rounded border border-[#333]">
                                        <input 
                                            type="color" 
                                            value={settings.background.gradient.end}
                                            onChange={(e) => updateSettings({ 
                                                background: { 
                                                    ...settings.background, 
                                                    gradient: { ...settings.background.gradient, end: e.target.value } 
                                                } 
                                            })}
                                            className="w-6 h-6 rounded cursor-pointer bg-transparent border-0 p-0"
                                        />
                                        <span className="text-[10px] font-mono">{settings.background.gradient.end}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] text-gray-500 uppercase mb-2 block">Direction</label>
                                <div className="grid grid-cols-3 gap-1 w-24 mx-auto bg-[#1f1f1f] p-1 rounded-lg">
                                    {directions.map((d, i) => (
                                        d.label === 'C' ? <div key={i} /> :
                                        <button
                                            key={d.value}
                                            onClick={() => updateSettings({ 
                                                background: { 
                                                    ...settings.background, 
                                                    gradient: { ...settings.background.gradient, direction: d.value } 
                                                } 
                                            })}
                                            className={`w-6 h-6 flex items-center justify-center rounded hover:bg-[#333] ${settings.background.gradient.direction === d.value ? 'bg-white text-black hover:bg-white' : 'text-gray-400'}`}
                                        >
                                            <svg className={`w-3 h-3 transform ${d.rotate}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                <path d="M12 5v14M5 12l7 7 7-7" />
                                            </svg>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* CUSTOM IMAGE UPLOAD (DnD) */}
                    {settings.background.type === 'image' && (
                        <div className="space-y-4">
                            <div 
                                className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all ${dragActive ? 'border-blue-500 bg-blue-500/10' : 'border-[#333] hover:border-gray-500 hover:bg-[#1a1a1a]'}`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                            >
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={handleCustomImageUpload}
                                    className="hidden"
                                    id="bg-upload"
                                />
                                <label htmlFor="bg-upload" className="cursor-pointer flex flex-col items-center justify-center gap-2">
                                    <svg className="w-8 h-8 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                        <polyline points="17 8 12 3 7 8" />
                                        <line x1="12" y1="3" x2="12" y2="15" />
                                    </svg>
                                    <span className="text-xs text-gray-300">
                                        Drag & Drop or Click to Upload
                                    </span>
                                </label>
                            </div>
                            {settings.background.image && (
                                    <div className="text-[10px] text-center text-gray-500">
                                    Current Image Loaded
                                    </div>
                            )}
                        </div>
                    )}

                    {/* Background Blur Control (Only for Wallpaper & Image) */}
                    {(settings.background.type === 'wallpaper' || settings.background.type === 'image') && (
                        <div className="border-t border-[#222] pt-4 mt-4">
                            <div className="flex justify-between text-xs mb-2">
                                <span className="text-gray-300 font-bold uppercase text-[10px]">Background Blur</span>
                                <span className="text-gray-500">{settings.background.blur}px</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="40"
                                value={settings.background.blur}
                                onChange={(e) => updateSettings({ 
                                    background: { ...settings.background, blur: Number(e.target.value) } 
                                })}
                                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-white"
                            />
                        </div>
                    )}
                </div>

                {/* Dimensions Section */}
                <div className="border-t border-[#222] pt-5">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Dimensions</h3>
                    
                    <div className="space-y-5">
                        {/* Aspect Ratio */}
                        <div>
                            <span className="text-[10px] text-gray-500 uppercase block mb-2">Aspect Ratio</span>
                            <div className="grid grid-cols-4 gap-2">
                                {['16/9', '4/3', '1/1', '9/16'].map((r) => (
                                    <button
                                        key={r}
                                        onClick={() => updateSettings({ aspectRatio: r as any })}
                                        className={`px-2 py-2 text-[10px] rounded-md border transition-all ${settings.aspectRatio === r ? 'bg-white text-black border-white' : 'bg-gray-800 text-gray-400 border-transparent hover:bg-gray-700'}`}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Padding */}
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-300">Padding</span>
                                <span className="text-gray-500">{settings.padding}px</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="128"
                                value={settings.padding}
                                onChange={(e) => updateSettings({ padding: Number(e.target.value) })}
                                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-white"
                            />
                        </div>

                        {/* Roundness */}
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-300">Roundness</span>
                                <span className="text-gray-500">{settings.borderRadius}px</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="48"
                                value={settings.borderRadius}
                                onChange={(e) => updateSettings({ borderRadius: Number(e.target.value) })}
                                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-white"
                            />
                        </div>

                         {/* Scale */}
                         <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-300">Scale</span>
                                <span className="text-gray-500">{Math.round(settings.scale * 100)}%</span>
                            </div>
                            <input
                                type="range"
                                min="0.5"
                                max="1.5"
                                step="0.05"
                                value={settings.scale}
                                onChange={(e) => updateSettings({ scale: Number(e.target.value) })}
                                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-white"
                            />
                        </div>
                    </div>
                </div>

                {/* Shadows Section */}
                <div className="border-t border-[#222] pt-5">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Shadow</h3>
                    <div className="grid grid-cols-3 gap-2">
                        {['none', 'md', 'xl', '2xl'].map((s) => (
                            <button
                                key={s}
                                onClick={() => updateSettings({ shadow: { ...settings.shadow, size: s as any } })}
                                className={`px-3 py-2 text-xs rounded-md border transition-all ${settings.shadow.size === s ? 'bg-white text-black border-white' : 'bg-gray-800 text-gray-400 border-transparent hover:bg-gray-700'}`}
                            >
                                {s === 'none' ? 'None' : s.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Window Section */}
                <div className="border-t border-[#222] pt-5">
                     <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Window</h3>
                     <label className="flex items-center justify-between cursor-pointer group">
                         <span className="text-sm text-gray-300">Dark Mode Window</span>
                         <input 
                             type="checkbox" 
                             checked={settings.darkModeWindow} 
                             onChange={(e) => updateSettings({ darkModeWindow: e.target.checked })}
                             className="sr-only peer"
                         />
                         <div className="relative w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                     </label>
                </div>
            </div>

            {/* Action Button (Fixed Footer) */}
            <div className="p-5 border-t border-[#222] bg-[#111111] space-y-3 z-10">
                {/* Format Selection */}
                <div className="flex items-center justify-between px-1">
                     <span className="text-xs text-gray-400">Format</span>
                     <select 
                        value={settings.outputFormat}
                        onChange={(e) => updateSettings({ outputFormat: e.target.value as ExportFormat })}
                        className="bg-[#1f1f1f] text-white text-xs border border-[#333] rounded px-2 py-1 outline-none focus:border-gray-500"
                     >
                         <option value="jpeg">JPEG</option>
                         <option value="png">PNG</option>
                         <option value="webp">WebP</option>
                     </select>
                </div>

                <div className="flex gap-2">
                    <button 
                        id="copy-btn"
                        onClick={async () => {
                            if (!imageData || copied || isCopying) return;
                            
                            setIsCopying(true); // Bắt đầu loading
                            try {
                                // Gọi hàm từ App.tsx để render ảnh và ghi vào clipboard
                                await onCopy(); 
                                
                                setCopied(true);
                                setTimeout(() => setCopied(false), 2000);
                            } catch (err) {
                                console.error('Failed to copy to clipboard:', err);
                                alert('Failed to copy image. Browser might not support this format.');
                            } finally {
                                setIsCopying(false); // Kết thúc loading
                            }
                        }}
                        className={`flex-1 py-3 font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${
                            copied 
                                ? 'bg-green-500 text-white' 
                                : 'bg-gray-700 text-white hover:bg-gray-600'
                        } ${isCopying ? 'opacity-75 cursor-wait' : ''}`}
                        disabled={!imageData || copied || isCopying}
                    >
                        {/* 4. CẬP NHẬT UI HIỂN THỊ TRẠNG THÁI */}
                        {isCopying ? (
                            // Icon Loading
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : copied ? (
                            // Icon Success
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        ) : (
                            // Icon Copy mặc định
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                        )}
                        
                        {/* Text thay đổi theo trạng thái */}
                        {isCopying ? 'Generating...' : (copied ? 'Copied!' : 'Copy')}
                    </button>
                    <button 
                        id="export-btn"
                        onClick={onDownload}
                        className="flex-1 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-md transition-all duration-150 ease-in-out flex items-center justify-center gap-2 shadow-sm hover:shadow active:scale-[0.98] active:shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-1"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Export
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;