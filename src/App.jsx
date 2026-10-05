import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { LayoutProvider } from './context/LayoutContext';
import Home from './pages/Home';
import ProjectDetails from './pages/ProjectDetails';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import Photography from './pages/Photography';
import WeddingFilms from './pages/WeddingFilms';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

function App() {
    return (
        <LayoutProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about-us" element={<AboutUs />} />
                    <Route path="/contact-us" element={<ContactUs />} />
                    <Route path="/photography" element={<Photography />} />
                    <Route path="/wedding-films" element={<WeddingFilms />} />
                    <Route path="/project/:id" element={<ProjectDetails />} />
                    
                    {/* Admin Routes */}
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin" element={<AdminLogin />} />
                </Routes>
            </BrowserRouter>
            <ToastContainer position="bottom-right" autoClose={3000} />
        </LayoutProvider>
    )
}

export default App
