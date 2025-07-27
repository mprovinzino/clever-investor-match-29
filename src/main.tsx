import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css'
import 'leaflet-draw/dist/leaflet.draw.css'

createRoot(document.getElementById("root")!).render(<App />);
