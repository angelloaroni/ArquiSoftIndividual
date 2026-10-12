import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

// Sin <StrictMode> a propósito: evita el doble render de desarrollo que distorsiona el benchmark.
createRoot(document.getElementById('root')).render(<App />);
