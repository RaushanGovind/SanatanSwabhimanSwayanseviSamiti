import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { isCommitteeMember } from '../utils/roleHelper';

const LoginCard = ({ isEmbedded = false }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ phone: '', password: '', role: 'family_head' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRoleChange = (role) => {
        setFormData({ ...formData, role: role });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const res = await api.login(formData);
            const data = res.data;

            if (data.access_token) {
                localStorage.setItem('token', data.access_token);
                localStorage.setItem('user', JSON.stringify(data.user));

                const user = data.user;
                const selectedRole = formData.role; // 'family_head', 'family_member', or 'admin'

                // Validate access based on selected login tab
                if (selectedRole === 'admin') {
                    // Committee tab selected - check if user has committee position
                    if (isCommitteeMember(user)) {
                        navigate('/admin/overview');
                    } else {
                        setError('❌ No Committee Role Assigned. You are not authorized to access the Committee Dashboard.');
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                    }
                } else if (selectedRole === 'family_head') {
                    // Head tab selected - check if user is a family head
                    if (user.role === 'family_head' || user.role === 'admin' || user.role === 'super_admin') {
                        navigate('/family/overview');
                    } else {
                        setError('❌ Not a Family Head. Please login using the correct tab.');
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                    }
                } else if (selectedRole === 'family_member') {
                    // Member tab selected - family heads can also view as members
                    if (user.role === 'family_member' || user.role === 'member' || user.role === 'family_head') {
                        navigate('/member/overview');
                    } else {
                        setError('❌ Not a Family Member. Please login using the correct tab.');
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                    }
                }
            }
        } catch (err) {
            console.error(err);
            if (err.response && err.response.data && err.response.data.detail) {
                setError(err.response.data.detail);
            } else {
                setError('System Error: Unable to connect to server. Ensure backend is running.');
            }
        }
    };

    return (
        <div className="login-card" style={{ background: 'white', padding: isEmbedded ? '30px' : '40px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '100%', maxWidth: '420px', margin: '0 auto' }}>
            <h2 style={{ textAlign: 'center', color: '#D87C1D', marginBottom: '20px' }}>Maa Jagdamba Samiti Login</h2>

            {/* Role Toggles */}
            <div style={{ display: 'flex', background: '#eee', borderRadius: '5px', padding: '5px', marginBottom: '20px' }}>
                <button
                    type="button"
                    onClick={() => handleRoleChange('family_head')}
                    style={{ flex: 1, padding: '8px', border: 'none', background: formData.role === 'family_head' ? 'white' : 'transparent', borderRadius: '4px', cursor: 'pointer', fontWeight: formData.role === 'family_head' ? 'bold' : 'normal', boxShadow: formData.role === 'family_head' ? '0 2px 3px rgba(0,0,0,0.1)' : 'none' }}
                >
                    👨‍👩‍👧 Head
                </button>
                <button
                    type="button"
                    onClick={() => handleRoleChange('family_member')}
                    style={{ flex: 1, padding: '8px', border: 'none', background: formData.role === 'family_member' ? 'white' : 'transparent', borderRadius: '4px', cursor: 'pointer', fontWeight: formData.role === 'family_member' ? 'bold' : 'normal', boxShadow: formData.role === 'family_member' ? '0 2px 3px rgba(0,0,0,0.1)' : 'none' }}
                >
                    👤 Member
                </button>
                <button
                    type="button"
                    onClick={() => handleRoleChange('admin')}
                    style={{ flex: 1, padding: '8px', border: 'none', background: formData.role === 'admin' ? 'white' : 'transparent', borderRadius: '4px', cursor: 'pointer', fontWeight: formData.role === 'admin' ? 'bold' : 'normal', boxShadow: formData.role === 'admin' ? '0 2px 3px rgba(0,0,0,0.1)' : 'none' }}
                >
                    🏛️ Committee
                </button>
            </div>

            {formData.role === 'admin' && (
                <p style={{ fontSize: '0.8rem', color: '#666', textAlign: 'center', marginTop: '-15px', marginBottom: '15px', fontStyle: 'italic' }}>
                    Access for: President, VP, Secretary, Treasurer, Executive Members, Coordinators
                </p>
            )}

            {error && <p style={{ color: 'red', textAlign: 'center', fontSize: '0.9rem', marginBottom: '15px' }}>{error}</p>}

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>
                        {formData.role === 'family_member' ? 'Member ID or Mobile Number' : 'Mobile Number or Email'}
                    </label>
                    <input
                        type="text"
                        name="phone"
                        placeholder={formData.role === 'family_member' ? 'F-XXXX-MXX or 9876543210' : '9876543210 or user@example.com'}
                        value={formData.phone}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                        required
                    />
                    {formData.role !== 'family_member' && (
                        <small style={{ color: '#888', fontSize: '0.8rem' }}>Allowed: 10-digit Mobile or valid Email</small>
                    )}
                    {formData.role === 'family_member' && (
                        <small style={{ color: '#888', fontSize: '0.8rem' }}>Use your Member ID or registered mobile number</small>
                    )}
                </div>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Password</label>
                    {formData.role === 'family_member' && <small style={{ display: 'block', marginBottom: '5px', color: '#777' }}>Use your Family Password</small>}
                    <div style={{ position: 'relative' }}>
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '10px', paddingRight: '40px', borderRadius: '4px', border: '1px solid #ccc' }}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{
                                position: 'absolute',
                                right: '10px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '1.2rem',
                                color: '#666'
                            }}
                        >
                            {showPassword ? '👁️' : '🙈'}
                        </button>
                    </div>
                </div>
                <button
                    type="submit"
                    style={{ width: '100%', padding: '12px', background: '#D87C1D', color: 'white', border: 'none', borderRadius: '4px', fontSize: '1rem', cursor: 'pointer' }}
                >
                    Login as {formData.role === 'family_head' ? 'Head' : (formData.role === 'admin' ? 'Committee Member' : 'Member')}
                </button>


                <div style={{ marginTop: '15px', textAlign: 'center' }}>
                    <span style={{ color: '#666', fontSize: '0.9rem' }}>Not a member yet? </span>
                    <button
                        type="button"
                        onClick={() => navigate('/signup')}
                        style={{ background: 'none', border: 'none', color: '#D87C1D', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.9rem' }}
                    >
                        Register your family
                    </button>
                </div>
            </form>

            {!isEmbedded && (
                <button onClick={() => navigate('/')} style={{ display: 'block', margin: '20px auto 0', background: 'none', border: 'none', color: '#666', cursor: 'pointer', textDecoration: 'underline' }}>
                    Back to Website
                </button>
            )}
        </div>
    );
};

export default LoginCard;
