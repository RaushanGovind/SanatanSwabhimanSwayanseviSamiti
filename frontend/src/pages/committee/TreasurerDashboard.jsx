
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import CommonDashboardContent from '../../components/dashboard/CommonDashboardContent';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { getRoleLabel } from '../../utils/roleHelper';
import DashboardOverview from '../../components/dashboard/DashboardOverview';

const TreasurerDashboard = () => {
    const { tab } = useParams();
    const navigate = useNavigate();
    const activeTab = tab || 'overview';

    const [stats, setStats] = useState({ totalFunds: 0, pendingDues: 0 });
    const [loading, setLoading] = useState(true);

    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        // Mock data
        setStats({ totalFunds: 0, pendingDues: 0 });
        setLoading(false);
    }, []);

    return (
        <DashboardLayout
            role="treasurer"
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
                            💰
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', opacity: 0.85, marginBottom: '4px', letterSpacing: '0.5px', textTransform: 'uppercase', fontWeight: 500 }}>Committee Dashboard</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
                                {user?.position?.replace(/_/g, ' ').toUpperCase() || 'TREASURER'}
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
            {loading ? <p>Loading financial data...</p> : (
                <>
                    {/* Common Tab Content */}
                    {['funds', 'contributions', 'rules', 'accounts', 'notices', 'profile', 'audit', 'inquiries', 'elections', 'governance', 'history', 'roles'].includes(activeTab) && (
                        <CommonDashboardContent activeTab={activeTab} role={user?.role} user={user} />
                    )}

                    {activeTab === 'overview' && (
                        <DashboardOverview role={user?.role} user={user} />
                    )}

                    {/* Treasurer Specific: Requests (for granting funds) */}
                    {activeTab === 'requests' && (
                        <div style={{ background: 'white', padding: '20px', borderRadius: '8px' }}>
                            <h3>Assistance Requests (Treasury View)</h3>
                            <p>Loading active requests...</p>
                            {/* We could embed AssistanceRequestManager here or similar */}
                        </div>
                    )}

                    {activeTab === 'families' && (
                        <div style={{ background: 'white', padding: '20px', borderRadius: '8px' }}>
                            <h3>Family Registry</h3>
                            <p>Viewing family contribution statuses...</p>
                        </div>
                    )}
                </>
            )}
        </DashboardLayout>
    );
};

export default TreasurerDashboard;
