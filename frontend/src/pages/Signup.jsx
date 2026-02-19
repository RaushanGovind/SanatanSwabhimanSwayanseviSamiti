import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';

const Signup = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    useEffect(() => {
        if (token) {
            const verify = async () => {
                try {
                    const res = await api.verifyToken(token);
                    if (res.data) {
                        setFormData(prev => ({
                            ...prev,
                            name: res.data.new_head_name || '',
                            phone: res.data.mobile || '',
                            email: res.data.email || ''
                        }));
                    }
                } catch (err) {
                    console.error("Token verification failed:", err);
                }
            };
            verify();
        }
    }, [token]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.phone.length !== 10) {
            setError('Mobile number must be 10 digits');
            return;
        }

        setLoading(true);
        try {
            await api.signup({
                name: formData.name,
                phone: formData.phone,
                email: formData.email,
                password: formData.password,
                role: 'family_head',
                recommendation_token: token
            });
            alert('Signup Successful! Your Login ID is your Mobile Number. You can now login and complete your family profile.');
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.detail || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f8fafc', padding: '20px' }}>
            <div style={{ background: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', width: '100%', maxWidth: '450px' }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h1 style={{ color: 'var(--primary-blue)', fontSize: '1.8rem', fontWeight: 800, margin: '0 0 10px 0' }}>Family Sign Up</h1>
                    <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Create your Head account to join Jagdamba Samiti</p>
                </div>

                {error && (
                    <div style={{ background: '#fef2f2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center', fontWeight: 600 }}>
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#334155', fontSize: '0.9rem' }}>Full Name of Head</label>
                        <input
                            type="text"
                            name="name"
                            placeholder="e.g. Rajesh Kumar"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '1rem' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#334155', fontSize: '0.9rem' }}>Mobile Number (Used for Login & ID)</label>
                        <input
                            type="tel"
                            name="phone"
                            placeholder="10-digit mobile number"
                            maxLength="10"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '1rem' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#334155', fontSize: '0.9rem' }}>Email Address (Optional)</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="e.g. rajesh@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '1rem' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#334155', fontSize: '0.9rem' }}>Create Password</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '1rem' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#334155', fontSize: '0.9rem' }}>Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '1rem' }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '14px',
                            background: 'var(--primary-blue)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontWeight: 700,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'opacity 0.2s'
                        }}
                    >
                        {loading ? 'Creating Account...' : 'Register for Account'}
                    </button>
                </form>

                <div style={{ marginTop: '30px', textAlign: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                        Already have an account? <Link to="/login" style={{ color: 'var(--primary-blue)', fontWeight: 700, textDecoration: 'none' }}>Login Here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
