// Global Leaflet loader utility using bundled packages
let leafletPromise: Promise<{ L: any; LeafletDraw: any }> | null = null;
let isLeafletLoaded = false;
let leafletCache: { L: any; LeafletDraw: any } | null = null;

export const loadLeaflet = (): Promise<{ L: any; LeafletDraw: any }> => {
  // Return cached version if already loaded
  if (isLeafletLoaded && leafletCache) {
    console.log('✅ Leaflet already loaded from cache');
    return Promise.resolve(leafletCache);
  }

  // Return existing promise if already loading
  if (leafletPromise) {
    console.log('🔄 Leaflet loading in progress...');
    return leafletPromise;
  }

  // Check if already available on window (from previous load)
  if ((window as any).L) {
    console.log('✅ Leaflet detected on window object');
    leafletCache = { L: (window as any).L, LeafletDraw: (window as any).L?.Draw };
    isLeafletLoaded = true;
    return Promise.resolve(leafletCache);
  }

  console.log('🚀 Starting Leaflet bundle loading...');

  leafletPromise = new Promise<{ L: any; LeafletDraw: any }>(async (resolve, reject) => {
    try {
      console.log('📦 Step 1: Loading Leaflet CSS...');
      
      // Import Leaflet CSS first
      await import('leaflet/dist/leaflet.css');
      console.log('✅ Step 1a: leaflet.css loaded');
      
      await import('leaflet-draw/dist/leaflet.draw.css');
      console.log('✅ Step 1b: leaflet-draw.css loaded');

      console.log('📦 Step 2: Loading Leaflet core module...');
      
      // Import Leaflet core
      const leafletModule = await import('leaflet');
      console.log('✅ Step 2: Leaflet core module imported', { 
        hasDefault: !!leafletModule.default,
        moduleKeys: Object.keys(leafletModule).slice(0, 10),
        moduleType: typeof leafletModule
      });

      console.log('📦 Step 3: Loading Leaflet Draw module...');
      
      // Import Leaflet Draw - make this optional for now
      let leafletDrawModule;
      try {
        leafletDrawModule = await import('leaflet-draw');
        console.log('✅ Step 3: Leaflet Draw imported');
      } catch (drawError) {
        console.warn('⚠️ Step 3: Leaflet Draw failed to load, continuing without it:', drawError);
        leafletDrawModule = null;
      }

      console.log('📦 Step 4: Setting up modules...');
      
      // Set up the modules - try both patterns
      let L = leafletModule.default;
      if (!L || !L.Map) {
        L = leafletModule;
      }
      
      console.log('✅ Step 4a: L object setup', {
        hasL: !!L,
        hasMap: !!L?.Map,
        hasTileLayer: !!L?.TileLayer,
        LType: typeof L,
        LKeys: L ? Object.keys(L).slice(0, 10) : []
      });

      const LeafletDraw = leafletDrawModule?.default || leafletDrawModule;

      // Attach to window for compatibility
      (window as any).L = L;
      console.log('✅ Step 4b: L attached to window');
      
      // Verify Leaflet is properly loaded
      if (!L) {
        throw new Error('Leaflet module is null or undefined');
      }
      
      if (!L.Map) {
        console.error('❌ L object structure:', Object.keys(L));
        throw new Error('Leaflet core failed to load properly - L.Map not available');
      }
      
      if (!L.TileLayer) {
        console.error('❌ L.TileLayer not available');
        throw new Error('Leaflet TileLayer not available');
      }

      console.log('📦 Step 5: Setting up Leaflet Draw (optional)...');
      
      if (leafletDrawModule && !L.Draw) {
        console.log('🔧 Attempting to attach Leaflet Draw to L object...');
        if (LeafletDraw && typeof LeafletDraw === 'object') {
          Object.assign(L, LeafletDraw);
          console.log('✅ Leaflet Draw manually attached');
        }
      }

      leafletCache = { L, LeafletDraw };
      isLeafletLoaded = true;
      console.log('🎉 All Leaflet resources loaded and cached successfully');
      resolve(leafletCache);

    } catch (error) {
      console.error('❌ Detailed Leaflet loading error:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });
      leafletPromise = null; // Reset so it can be retried
      reject(new Error(`Leaflet loading failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  });

  return leafletPromise;
};

// Check if Leaflet is available
export const isLeafletAvailable = (): boolean => {
  return !!(window as any).L && isLeafletLoaded;
};

// Reset loader state (useful for testing)
export const resetLeafletLoader = (): void => {
  leafletPromise = null;
  isLeafletLoaded = false;
  leafletCache = null;
};