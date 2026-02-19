import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import CommonDashboardContent from '../../components/dashboard/CommonDashboardContent';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { getRoleLabel } from '../../utils/roleHelper';
import DashboardOverview from '../../components/dashboard/DashboardOverview';

const SecretaryDashboard = () => {
    const { tab } = useParams();
    const navigate = useNavigate();
    const activeTab = tab || 'overview';
    const [families, setFamilies] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.getFamilies();
                setFamilies(res.data);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        fetchData();
    }, []);

    return (
        <DashboardLayout
            role="secretary"
            title={getRoleLabel(user)}
            showTitle={false}
            banner={(
                <div style={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    padding: '24px 32px',
                    borderRadius: '0',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    color: 'white',
                    width: '100%'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                            width: '56px',
                            height: '56px',
                            background: 'rgba(255,255,255,0.15)',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.75rem',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255,255,255,0.2)'
                        }}>
                            ✍️
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', opacity: 0.85, marginBottom: '4px', letterSpacing: '0.5px', textTransform: 'uppercase', fontWeight: 500 }}>Committee Dashboard</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
                                {user?.position?.replace(/_/g, ' ').toUpperCase() || 'SECRETARY'}
                            </div>
                            <div style={{ fontSize: '0.875rem', opacity: 0.9, marginTop: '2px' }}>
                                {user?.name}
                            </div>
                        </div>
                    </div>
                    <div style={{
                        background: 'rgba(255,255,255,0.15)',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        letterSpacing: '0.3px'
                    }}>
                        🔐 Committee Access
                    </div>
                </div>
            )}
        >
            {loading ? <p>Loading...</p> : (
                <>
                    {/* Common Tab Content */}
                    {['funds', 'contributions', 'rules', 'accounts', 'notices', 'profile', 'audit', 'inquiries', 'elections', 'governance', 'history', 'roles'].includes(activeTab) && (
                        <CommonDashboardContent activeTab={activeTab} role={user?.role} user={user} />
                    )}

                    {activeTab === 'overview' && (
                        <DashboardOverview role={user?.role} user={user} />
                    )}

                    {activeTab === 'families' && (
                        <div style={{ background: 'white', padding: '20px', borderRadius: '8px' }}>
                            <h3>Family Registry</h3>
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                                <thead>
                                    <tr style={{ background: '#f5f5f5', textAlign: 'left' }}>
                                        <th style={{ padding: '10px' }}>ID</th>
                                        <th style={{ padding: '10px' }}>Head Name</th>
                                        <th style={{ padding: '10px' }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {families.map(fam => (
                                        <tr key={fam._id || fam.id}>
                                            <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{fam.family_unique_id}</td>
                                            <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{fam.head_details?.full_name || fam.head_name}</td>
                                            <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{fam.status}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'requests' && (
                        <div style={{ background: 'white', padding: '20px', borderRadius: '8px' }}>
                            <h3>Help Requests Queue</h3>
                            <p>Loading assistance tickets for review...</p>
                        </div>
                    )}

                    {activeTab === 'minutes' && (
                        <div style={{ background: 'white', padding: '20px', borderRadius: '8px' }}>
                            <h3>Minutes of Meeting (MOM)</h3>
                            <p>No minutes recorded yet.</p>
                            <button style={{ padding: '8px 15px', background: '#1976D2', color: 'white', border: 'none', borderRadius: '4px' }}>+ New Entry</button>
                        </div>
                    )}
                </>
            )}
        </DashboardLayout>
    );
};

export default SecretaryDashboard;
