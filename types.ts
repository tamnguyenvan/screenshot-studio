export type BackgroundType = 'wallpaper' | 'gradient' | 'solid' | 'image';

export type GradientDirection = 
    | 'to right' 
    | 'to left' 
    | 'to bottom' 
    | 'to top' 
    | 'to bottom right' 
    | 'to bottom left' 
    | 'to top right' 
    | 'to top left';

export interface GradientConfig {
    start: string;
    end: string;
    direction: GradientDirection;
}

export interface BackgroundConfig {
    type: BackgroundType;
    solid: string;
    gradient: GradientConfig;
    image: string; // base64 or url
    blur: number;
}

export interface ShadowConfig {
    size: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    color: string;
    opacity: number;
}

export type ExportFormat = 'png' | 'jpeg' | 'webp';

export interface EditorSettings {
    padding: number;
    borderRadius: number;
    rotate: number;
    scale: number;
    aspectRatio: '16/9' | '4/3' | '1/1' | '9/16';
    background: BackgroundConfig;
    shadow: ShadowConfig;
    darkModeWindow: boolean;
    outputFormat: ExportFormat;
}

export interface GeneratedPalette {
    colors: string[];
    description?: string;
}