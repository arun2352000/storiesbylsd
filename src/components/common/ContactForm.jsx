import React, { useState } from 'react';
import { api } from '../../services/api';

const ContactForm = () => {
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
    const [status, setStatus] = useState('');

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('Sending...');
        try {
            await api.postMessage(formData);
            setStatus('Message sent successfully!');
            setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        } catch (error) {
            setStatus('Failed to send message. Please try again.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 w-full max-w-2xl mx-auto">
            {/* Name */}
            <div>
                <input
                    type="text" name="name" value={formData.name} onChange={handleChange} required
                    placeholder="NAME"
                    className="w-full bg-transparent border border-brand-cream text-brand-cream placeholder-brand-cream px-3 sm:px-4 py-2.5 sm:py-3 focus:outline-none focus:border-white transition-colors text-xs sm:text-sm tracking-widest font-light"
                />
            </div>

            {/* Email */}
            <div>
                <input
                    type="email" name="email" value={formData.email} onChange={handleChange} required
                    placeholder="EMAIL"
                    className="w-full bg-transparent border border-brand-cream text-brand-cream placeholder-brand-cream px-3 sm:px-4 py-2.5 sm:py-3 focus:outline-none focus:border-white transition-colors text-xs sm:text-sm tracking-widest font-light"
                />
            </div>

            {/* Phone */}
            <div>
                <input
                    type="tel" name="phone" value={formData.phone} onChange={handleChange}
                    placeholder="PHONE"
                    className="w-full bg-transparent border border-brand-cream text-brand-cream placeholder-brand-cream px-3 sm:px-4 py-2.5 sm:py-3 focus:outline-none focus:border-white transition-colors text-xs sm:text-sm tracking-widest font-light"
                />
            </div>

            {/* Subject */}
            <div>
                <input
                    type="text" name="subject" value={formData.subject} onChange={handleChange}
                    placeholder="SUBJECT"
                    className="w-full bg-transparent border border-brand-cream text-brand-cream placeholder-brand-cream px-3 sm:px-4 py-2.5 sm:py-3 focus:outline-none focus:border-white transition-colors text-xs sm:text-sm tracking-widest font-light"
                />
            </div>

            {/* Message */}
            <div>
                <textarea
                    name="message" value={formData.message} onChange={handleChange} required
                    placeholder="MESSAGE"
                    rows="4"
                    className="w-full bg-transparent border border-brand-cream text-brand-cream placeholder-brand-cream px-3 sm:px-4 py-2.5 sm:py-3 focus:outline-none focus:border-white transition-colors text-xs sm:text-sm tracking-widest font-light resize-none"
                ></textarea>
            </div>

            {/* Status */}
            {status && (
                <div className={`text-sm ${status.includes('success') ? 'text-green-400' : status.includes('Failed') ? 'text-red-400' : 'text-gray-300'}`}>
                    {status}
                </div>
            )}

            {/* Submit */}
            <div className="pt-2">
                <button
                    type="submit"
                    className="border border-brand-cream text-brand-cream px-8 sm:px-12 py-2.5 sm:py-3 text-xs sm:text-sm tracking-widest hover:bg-brand-cream hover:text-black transition-colors"
                >
                    SEND MESSAGE
                </button>
            </div>
        </form>
    );
};

export default ContactForm;
