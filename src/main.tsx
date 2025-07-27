import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Mapbox CSS will be loaded dynamically to prevent conflicts

createRoot(document.getElementById("root")!).render(<App />);
