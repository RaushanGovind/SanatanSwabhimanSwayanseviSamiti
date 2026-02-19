import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';

const Contact = () => {
    const { t } = useLanguage();
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.submitInquiry(formData);
            alert(t.contact.alert || "Message sent successfully!");
            setFormData({ name: '', email: '', phone: '', message: '' });
        } catch (err) {
            console.error(err);
            alert("Failed to send message. Please try again later.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section id="contact" className="section-padding bg-dark text-white" style={{ padding: '80px 0' }}>
            <div className="container">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '50px', alignItems: 'start' }}>
                    <div className="contact-info">
                        <h2 className="section-title text-white" style={{ textAlign: 'left', marginBottom: '30px' }}>{t.contact.title}</h2>
                        <div className="contact-details" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                                <strong style={{ color: 'var(--primary)', display: 'block', marginBottom: '5px' }}>📍 {t.contact.address_label}</strong>
                                {t.contact.address_value}
                            </div>
                            <div style={{ padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                                <strong style={{ color: 'var(--primary)', display: 'block', marginBottom: '5px' }}>👤 {t.contact.person_label}</strong>
                                [President Name]
                            </div>
                            <div style={{ padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                                <strong style={{ color: 'var(--primary)', display: 'block', marginBottom: '5px' }}>📞 {t.contact.phone_label}</strong>
                                +91 XXXXXXXXXX
                            </div>
                        </div>
                    </div>

                    <div className="contact-form-container" style={{ background: 'white', padding: '40px', borderRadius: '20px', color: '#333' }}>
                        <h3 style={{ marginBottom: '25px', color: '#2C3E50', fontWeight: 800 }}>Send us a Message</h3>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                                />
                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    required
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                                />
                            </div>
                            <input
                                type="tel"
                                placeholder="Phone Number"
                                required
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                            />
                            <textarea
                                placeholder="How can we help you?"
                                rows="4"
                                required
                                value={formData.message}
                                onChange={e => setFormData({ ...formData, message: e.target.value })}
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', resize: 'none' }}
                            ></textarea>
                            <button
                                type="submit"
                                disabled={submitting}
                                style={{
                                    background: 'var(--primary)',
                                    color: 'white',
                                    padding: '15px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s',
                                    opacity: submitting ? 0.7 : 1
                                }}
                            >
                                {submitting ? 'Sending...' : 'Send Message 🚀'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};


export default Contact;
