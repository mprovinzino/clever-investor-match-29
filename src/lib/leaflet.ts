// Lazy Leaflet initialization - only loads when needed
let leafletLoaded = false;

export const initializeLeaflet = async () => {
  if (leafletLoaded) return (window as any).L;
  
  try {
    // Dynamic imports to avoid blocking app startup
    const L = (await import('leaflet')).default;
    await import('leaflet/dist/leaflet.css');
    await import('leaflet-draw/dist/leaflet.draw.css');
    await import('leaflet-draw');

    // Fix default markers
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });

    // Make Leaflet available globally
    (window as any).L = L;
    leafletLoaded = true;
    
    return L;
  } catch (error) {
    console.error('Failed to load Leaflet:', error);
    throw error;
  }
};