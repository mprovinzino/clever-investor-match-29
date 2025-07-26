// Simplified Leaflet loader with direct imports
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Import and configure leaflet-draw only when needed
let leafletDrawLoaded = false;

// Fix default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export const loadLeaflet = async (): Promise<{ L: any; LeafletDraw?: any }> => {
  console.log('🚀 Loading Leaflet...');
  
  try {
    // Leaflet is already imported, just return it
    console.log('✅ Leaflet core loaded');
    
    // Load Leaflet Draw if not already loaded
    let LeafletDraw = null;
    if (!leafletDrawLoaded) {
      try {
        await import('leaflet-draw/dist/leaflet.draw.css');
        const drawModule = await import('leaflet-draw');
        leafletDrawLoaded = true;
        LeafletDraw = drawModule.default || drawModule;
        console.log('✅ Leaflet Draw loaded');
      } catch (drawError) {
        console.warn('⚠️ Leaflet Draw failed to load:', drawError);
      }
    }

    // Attach to window for compatibility
    (window as any).L = L;
    
    console.log('🎉 Leaflet ready');
    return { L, LeafletDraw };
    
  } catch (error) {
    console.error('❌ Leaflet loading failed:', error);
    throw new Error(`Failed to load Leaflet: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Check if Leaflet is available
export const isLeafletAvailable = (): boolean => {
  return !!(window as any).L;
};

// Reset loader state (useful for testing)
export const resetLeafletLoader = (): void => {
  leafletDrawLoaded = false;
};