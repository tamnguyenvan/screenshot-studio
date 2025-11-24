import React, { useState, useRef, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Canvas from './components/Canvas';
import { EditorSettings } from './types';
import { toPng, toJpeg, toBlob } from 'html-to-image';

const App: React.FC = () => {
    const [image, setImage] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const exportRef = useRef<HTMLDivElement>(null);
    
    const [settings, setSettings] = useState<EditorSettings>({
        padding: 64,
        borderRadius: 16,
        rotate: 0,
        scale: 1,
        aspectRatio: '16/9',
        background: {
            type: 'wallpaper',
            solid: '#1a1a1a',
            gradient: {
                start: '#09203f',
                end: '#537895',
                direction: 'to top'
            },
            image: '', // Initially empty, sidebar can load default
            blur: 0
        },
        shadow: {
            size: 'xl',
            color: '#000000',
            opacity: 0.5
        },
        darkModeWindow: true,
        outputFormat: 'jpeg'
    });

    // Helper to read and set image from File
    const processFile = (file: File) => {
        if (!file || !file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            setImage(event.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    // Paste support for images
    useEffect(() => {
        const handlePaste = (e: ClipboardEvent) => {
            const items = e.clipboardData?.items;
            if (items) {
                for (let i = 0; i < items.length; i++) {
                    if (items[i].type.indexOf('image') !== -1) {
                        const file = items[i].getAsFile();
                        if (file) {
                            e.preventDefault();
                            processFile(file);
                        }
                        break;
                    }
                }
            }
        };
        window.addEventListener('paste', handlePaste);
        return () => window.removeEventListener('paste', handlePaste);
    }, []);

    // Load a default wallpaper on mount
    useEffect(() => {
        const loadDefaultWallpaper = async () => {
            try {
                // ID 10 is a safe nature/texture background
                setSettings(prev => ({
                    ...prev,
                    background: { ...prev.background, image: '/wallpapers/hires/gradient-wallpaper-0001.jpg'}
                }));
            } catch (e) {
                console.error("Failed to load default wallpaper", e);
            }
        };
        loadDefaultWallpaper();
    }, []);

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processFile(file);
        } else {
            // Handle reset case where value is cleared or no file selected
            setImage(null);
        }
    };

    const handleCopy = async () => {
    if (!exportRef.current || !image) return;
    
    // Delay nhỏ để đảm bảo UI ổn định
    await new Promise(resolve => setTimeout(resolve, 100));

    const pixelRatio = 2; 
    const backgroundColor = settings.background.type === 'solid' ? settings.background.solid : '#000';
    
    // Dùng toBlob của html-to-image
    const blob = await toBlob(exportRef.current, { 
        cacheBust: true, 
        pixelRatio, 
        backgroundColor,
        // Clipboard API thường hỗ trợ tốt nhất là PNG
        type: 'image/png' 
    });

    if (blob) {
        await navigator.clipboard.write([
            new ClipboardItem({ [blob.type]: blob })
        ]);
    }
};

    const updateSettings = (newSettings: Partial<EditorSettings>) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    };

    const handleDownload = async () => {
        if (!exportRef.current || !image) return;
        
        const btn = document.getElementById('export-btn');
        const originalText = btn?.innerText;
        if (btn) btn.innerText = "Generating...";
        
        try {
            // Small delay to ensure render stability
            await new Promise(resolve => setTimeout(resolve, 100));

            let downloadUrl = '';
            const pixelRatio = 2; // High quality
            const backgroundColor = settings.background.type === 'solid' ? settings.background.solid : '#000';

            if (settings.outputFormat === 'png') {
                downloadUrl = await toPng(exportRef.current, { cacheBust: true, pixelRatio });
            } else if (settings.outputFormat === 'jpeg') {
                downloadUrl = await toJpeg(exportRef.current, { cacheBust: true, pixelRatio, quality: 1.0, backgroundColor });
            } else if (settings.outputFormat === 'webp') {
                 // html-to-image handles webp via toBlob or toDataUrl with mime type
                 const blob = await toBlob(exportRef.current, { cacheBust: true, pixelRatio, type: 'image/webp' });
                 if (blob) {
                     downloadUrl = URL.createObjectURL(blob);
                 }
            }

            if (downloadUrl) {
                const link = document.createElement('a');
                link.download = `screenshot-studio-export.${settings.outputFormat}`;
                link.href = downloadUrl;
                link.click();
                
                if (settings.outputFormat === 'webp') {
                    URL.revokeObjectURL(downloadUrl);
                }
            }
            
        } catch (err) {
            console.error("Export failed:", err);
            alert("Could not export image. If this persists, please try a different background or browser.");
        } finally {
            if (btn && originalText) btn.innerText = originalText;
        }
    };

    return (
        <div className="fixed inset-0 w-full h-full flex bg-black text-white font-sans overflow-hidden selection:bg-purple-500 selection:text-white">
            {/* Top Bar */}
            <div className="absolute top-0 left-0 z-50 p-6 pointer-events-none">
                <div className="flex items-center gap-3 pointer-events-auto">
                    <div className="w-8 h-8 bg-transparent rounded-lg flex items-center justify-center text-black p-1">
                        <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false" className="w-full h-full text-blue-500">
                            <path d="M0.5 0C0.367392 0 0.240215 0.0526784 0.146447 0.146447C0.0526784 0.240215 0 0.367392 0 0.5L0 1H0.5C0.632608 1 0.759785 0.947322 0.853553 0.853553C0.947322 0.759785 1 0.632608 1 0.5V0H0.5ZM0.5 0.75C0.433696 0.75 0.370107 0.723661 0.323223 0.676777C0.276339 0.629893 0.25 0.566304 0.25 0.5C0.25 0.433696 0.276339 0.370107 0.323223 0.323223C0.370107 0.276339 0.433696 0.25 0.5 0.25C0.566304 0.25 0.629893 0.276339 0.676777 0.323223C0.723661 0.370107 0.75 0.433696 0.75 0.5C0.75 0.566304 0.723661 0.629893 0.676777 0.676777C0.629893 0.723661 0.566304 0.75 0.5 0.75Z" fill="currentColor" transform="scale(100)"></path>
                        </svg>
                    </div>
                    <span className="font-bold tracking-tight text-lg">Screenshot Studio</span>
                </div>
            </div>

            <Canvas 
                settings={settings} 
                image={image} 
                onUpload={handleUpload}
                onFileDrop={processFile}
                exportRef={exportRef}
            />
            
            <Sidebar 
                settings={settings} 
                updateSettings={updateSettings}
                imageData={image}
                isAnalyzing={isAnalyzing}
                setIsAnalyzing={setIsAnalyzing}
                onDownload={handleDownload}
                onCopy={handleCopy}
            />
        </div>
    );
};

export default App;