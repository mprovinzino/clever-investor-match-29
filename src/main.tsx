import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Import Leaflet CSS statically to ensure it loads before JavaScript
import 'leaflet/dist/leaflet.css'
import 'leaflet-draw/dist/leaflet.draw.css'

createRoot(document.getElementById("root")!).render(<App />);
