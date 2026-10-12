import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../services/adminApi';
import logo from '../assets/image/logo/PRIMARY LOGO.png';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await adminApi.login(email, password);
            navigate('/admin/dashboard');
        } catch (err) {
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 text-gray-900">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border border-gray-200">
                <div className="text-center mb-8">
                    <img src={logo} alt="LSD Logo" className="h-12 w-auto mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Admin Login</h2>
                    <p className="text-sm text-gray-500 mt-1">Sign in to manage your portfolio and site content</p>
                </div>

                {error && (
                    <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-3 text-center text-sm font-medium text-red-700">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">
                            Email Address
                        </label>
                        <input 
                            type="email" 
                            placeholder="admin@example.com" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20 focus:outline-none transition-all"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">
                            Password
                        </label>
                        <input 
                            type="password" 
                            placeholder="••••••••" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20 focus:outline-none transition-all"
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full rounded-lg bg-gray-900 py-3 px-4 font-semibold text-white shadow-md hover:bg-black active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
                    >
                        {loading ? (
                            <span className="inline-flex items-center gap-2">
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                Signing in...
                            </span>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
