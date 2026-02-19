import React, { useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { getRoleLabel, getAuthUser } from '../../utils/roleHelper';
import { useLanguage } from '../../context/LanguageContext';
import { Globe, ArrowLeft, ChevronLeft, ChevronRight, Menu, LogOut, User as ProfileIcon, ShieldCheck } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const DashboardLayout = ({ role, title, showTitle = true, banner, children, sidebarMenuItems, activeTabValue }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { tab } = useParams();
    const user = getAuthUser();
    const { language, toggleLanguage } = useLanguage();
    const { themeMode } = useTheme();

    // Move HOOKS to top level, before any early returns
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    const [isCollapsed, setIsCollapsed] = React.useState(false);
    const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 900);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 900;
            setIsMobile(mobile);
            if (!mobile) setIsSidebarOpen(false);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (!user) navigate('/login');
    }, [user, navigate]);

    // Derived values can be calculated after hooks
    const segments = location.pathname.split('/');
    const basePath = `/${segments[1] || 'admin'}`;
    const activeTab = tab || new URLSearchParams(location.search).get('tab') || 'overview';

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
        window.location.reload();
    };

    // Early return for no user - MUST be after hooks
    if (!user) return <div style={{ padding: '50px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>Authenticating...</div>;

    // --- MENU CONFIGURATION ---

    // 1. Sidebar Items (Profile & Personal Workspace)
    const sidebarItems = [
        { label: 'Dashboard', icon: '🏠', tab: 'overview' },
        { label: 'My Profile', icon: '👤', tab: 'profile' }
    ];

    // 2. Global/Header Items (Organization & Management)
    const headerItems = [
        { label: 'Funds', icon: '💰', tab: 'funds' },
        { label: 'Contributions', icon: '📜', tab: 'contributions' },
        { label: 'Global Collections', icon: '🌍', tab: 'global-collections' },
        { label: 'Rules', icon: '📘', tab: 'rules' },
        { label: 'Accounts', icon: '📊', tab: 'accounts' },
        { label: 'Notices', icon: '📢', tab: 'notices' },
        { label: 'Committee', icon: '📜', tab: 'history' }
    ];

    const isCommittee = ['president', 'vice_president', 'secretary', 'joint_secretary', 'treasurer', 'executive_member', 'coordinator'].includes(user.position) || user.role === 'admin' || user.role === 'super_admin';

    // -- Role Based Injections --

    // Family Head Personal Items
    if (user.role === 'family_head') {
        sidebarItems.splice(2, 0, { label: 'My Family', icon: '👨‍👩‍👧‍👦', tab: 'family' });
        sidebarItems.splice(3, 0, { label: 'My Coordinator', icon: '🤝', tab: 'coordinator' });
        if (!isCommittee) {
            sidebarItems.splice(4, 0, { label: 'Request Help', icon: '🆘', tab: 'help' });
        }
    }
    // Member Personal Items
    if (user.role === 'family_member' || user.role === 'member') {
        sidebarItems.splice(2, 0, { label: 'My Family', icon: '👨‍👩‍👧‍👦', tab: 'family' });
        sidebarItems.splice(3, 0, { label: 'My Coordinator', icon: '🤝', tab: 'coordinator' });
    }

    // Management / Committee Items (Moving to Sidebar as they are role-specific)
    if (['super_admin', 'admin'].includes(user.role) || ['president', 'secretary', 'coordinator', 'treasurer'].includes(user.position)) {
        sidebarItems.push({ label: 'Registry', icon: '👥', tab: 'families' });
        sidebarItems.push({ label: 'Audit', icon: '🛡️', tab: 'audit' });
        sidebarItems.push({ label: 'Inquiries', icon: '📞', tab: 'inquiries' });
    }

    if (isCommittee || ['super_admin', 'admin'].includes(user.role)) {
        sidebarItems.push({ label: 'Requests', icon: '🆘', tab: 'requests' });
    }

    if (['super_admin', 'admin'].includes(user.role) || user.position === 'president') {
        sidebarItems.push({ label: 'Roles', icon: '⚙️', tab: 'roles' });
        headerItems.push({ label: 'Elections', icon: '🗳️', tab: 'elections' });
        headerItems.push({ label: 'Governance', icon: '⚖️', tab: 'governance' });
    } else if (isCommittee || user.role === 'family_head') {
        headerItems.push({ label: 'Elections', icon: '🗳️', tab: 'elections' });
        headerItems.push({ label: 'Governance', icon: '⚖️', tab: 'governance' });
    }

    // 3. Final Menu Selection
    const finalSidebarItems = sidebarMenuItems || sidebarItems;

    let finalHeaderItems = headerItems;
    // For Family Heads (non-committee), simplify header
    if (user.role === 'family_head' && !isCommittee) {
        // "only about their family related information .. along with current collection conducted .. notices etc"
        // Also keep Funds/Contributions for transparency. Rules are standard.
        // Hiding: Accounts (too detailed?), Committee History (less relevant?)
        finalHeaderItems = headerItems.filter(item =>
            ['funds', 'contributions', 'global-collections', 'notices', 'rules', 'elections', 'governance'].includes(item.tab)
        );
    }
    const mobileMenuItems = [...finalSidebarItems, ...finalHeaderItems];

    const handleNavClick = (t) => {
        const path = t === 'overview' ? basePath : `${basePath}/${t}`;
        navigate(path);
        setIsSidebarOpen(false);
    };

    // --- JAGDAMBA THEME SIDEBAR LAYOUT (Desktop) ---
    if (!isMobile) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: 'var(--bg-page)', color: 'var(--text-main)' }}>

                {/* TOP HEADER - Full Width */}
                <header style={{
                    height: '80px',
                    background: '#FFF7ED', // Uniform Cream Background
                    display: 'flex',
                    alignItems: 'center',
                    borderBottom: '1px solid var(--border-color)',
                    zIndex: 1100,
                    flexShrink: 0,
                    position: 'relative' // Fix for z-index layering
                }}>
                    {/* Fixed Logo Section */}
                    <div style={{
                        width: '290px', // INCREASED WIDTH
                        height: '100%',
                        background: '#FFF7ED', // Cream background as requested
                        borderRight: '1px solid var(--border-color)',
                        display: 'flex', alignItems: 'center', padding: '0 15px', gap: '10px' // REDUCED PADDING/GAP
                    }}>
                        <div style={{
                            width: '42px', height: '42px',
                            background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                            borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontWeight: 900, fontSize: '1rem',
                            boxShadow: '0 4px 10px rgba(217, 119, 6, 0.3)',
                            flexShrink: 0, border: '2px solid white'
                        }}>
                            JS
                        </div>
                        <div style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            <h2 style={{ margin: 0, color: '#7c2d12', fontSize: '1.25rem', fontWeight: 800, fontFamily: "'Merriweather', 'Playfair Display', serif", letterSpacing: '-0.02em' }}>Jagdamba Samiti</h2>
                            <div style={{ fontSize: '0.55rem', color: '#92400e', letterSpacing: '0.3px', fontWeight: 700, textTransform: 'uppercase', marginTop: '2px', fontFamily: "'Inter', sans-serif" }}>Seva • Sankalp • Samarpan</div>
                        </div>
                    </div>

                    {/* Header Controls (Right Side) */}
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 30px' }}>

                        {/* Search Bar */}
                        <div style={{
                            display: 'flex', alignItems: 'center', background: '#f8f9fa',
                            padding: '8px 15px', borderRadius: '20px', width: '250px', border: '1px solid #eee'
                        }}>
                            <span style={{ marginRight: '8px', opacity: 0.5 }}>🔍</span>
                            <input
                                placeholder="Search..."
                                style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.9rem' }}
                            />
                        </div>

                        {/* Global Nav Items */}
                        <div style={{ flex: 1, margin: '0 20px', overflowX: 'auto', display: 'flex', alignItems: 'center', gap: '5px', scrollbarWidth: 'none' }}>
                            {finalHeaderItems.map((item, idx) => {
                                const isActive = activeTab === (item.tab);
                                return (
                                    <div
                                        key={idx}
                                        onClick={() => handleNavClick(item.tab)}
                                        style={{
                                            padding: '8px 14px', borderRadius: '6px', cursor: 'pointer',
                                            fontSize: '0.95rem', fontWeight: isActive ? 700 : 500,
                                            color: isActive ? 'var(--primary-blue)' : '#444',
                                            background: isActive ? '#eef2ff' : 'transparent',
                                            whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '8px',
                                            transition: 'all 0.2s'
                                        }}
                                        title={item.label}
                                        onMouseOver={(e) => !isActive && (e.currentTarget.style.background = '#f5f5f5')}
                                        onMouseOut={(e) => !isActive && (e.currentTarget.style.background = 'transparent')}
                                    >
                                        <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>{item.icon}</span>
                                        {item.label}
                                    </div>
                                )
                            })}
                        </div>

                        {/* Profile Pill & Notifs */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <div style={{ position: 'relative', cursor: 'pointer', display: 'flex' }}>
                                <div style={{
                                    padding: '8px',
                                    borderRadius: '12px',
                                    background: 'white',
                                    border: '1px solid var(--border-color)',
                                    display: 'flex',
                                    color: 'var(--text-muted)',
                                    transition: 'all 0.2s'
                                }} onMouseOver={e => e.currentTarget.style.background = '#f8fafc'}>
                                    <span style={{ fontSize: '1.1rem' }}>🔔</span>
                                </div>
                                <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'var(--danger)', color: 'white', fontSize: '0.65rem', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, border: '2px solid #FFF7ED' }}>1</span>
                            </div>

                            {/* Top Profile Pill */}
                            <div
                                onClick={() => handleNavClick('profile')}
                                style={{
                                    display: 'flex', alignItems: 'center', background: 'white',
                                    padding: '6px 14px 6px 6px', borderRadius: '40px',
                                    gap: '10px', border: '1px solid var(--border-color)',
                                    cursor: 'pointer', transition: 'all 0.2s',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                                }}
                                onMouseOver={e => e.currentTarget.style.borderColor = 'var(--primary-blue)'}
                                onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
                            >
                                <div style={{
                                    width: '32px', height: '32px', borderRadius: '50%',
                                    overflow: 'hidden', border: '2px solid #FEF3C7', flexShrink: 0,
                                    background: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    {user?.profile_photo ? (
                                        <img src={user.profile_photo} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <span style={{ color: 'white', fontWeight: 800, fontSize: '0.8rem' }}>{user?.name?.charAt(0)}</span>
                                    )}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        {user?.name.split(' ')[0]}
                                    </span>
                                    <span style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--primary-blue)', textTransform: 'uppercase' }}>
                                        {getRoleLabel(user)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* MIDDLE CONTENT WRAPPER */}
                <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

                    {/* LEFT SIDEBAR - Only Navigation Collapses */}
                    <aside style={{
                        width: isCollapsed ? '80px' : '290px',
                        background: 'var(--sidebar-bg)',
                        borderRight: '1px solid var(--border-color)',
                        display: 'flex', flexDirection: 'column',
                        transition: 'width 0.3s ease',
                        flexShrink: 0,
                        zIndex: 1000
                    }}>
                        {/* Collapse Toggle */}
                        <div style={{ padding: '10px', display: 'flex', justifyContent: isCollapsed ? 'center' : 'flex-end', borderBottom: '1px solid var(--border-color)' }}>
                            <button
                                onClick={() => setIsCollapsed(!isCollapsed)}
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '5px', display: 'flex' }}
                                title={isCollapsed ? "Expand" : "Collapse"}
                            >
                                {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                            </button>
                        </div>

                        {/* Navigation Items */}
                        <nav style={{ flex: 1, padding: '10px', overflowY: 'auto', overflowX: 'hidden' }}>
                            {!isCollapsed && <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', margin: '10px 0 5px 10px', textTransform: 'uppercase' }}>Personal</p>}
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                {finalSidebarItems.map((item, idx) => {
                                    const isActive = activeTab === (item.id || item.tab || 'overview');
                                    return (
                                        <li
                                            key={idx}
                                            onClick={() => handleNavClick(item.id || item.tab)}
                                            style={{
                                                padding: '12px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center',
                                                justifyContent: isCollapsed ? 'center' : 'flex-start',
                                                gap: '12px', borderRadius: '10px', transition: 'all 0.2s',
                                                background: isActive ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'transparent',
                                                color: isActive ? 'white' : 'var(--sidebar-text)',
                                                fontWeight: isActive ? 700 : 500, fontSize: '0.9rem', position: 'relative',
                                                boxShadow: isActive ? '0 4px 12px rgba(217, 119, 6, 0.2)' : 'none'
                                            }}
                                            className="sidebar-item"
                                            title={isCollapsed ? item.label : ''}
                                            onMouseOver={(e) => !isActive && (e.currentTarget.style.background = 'var(--sidebar-hover)')}
                                            onMouseOut={(e) => !isActive && (e.currentTarget.style.background = 'transparent')}
                                        >
                                            <span style={{ fontSize: '1.2rem', width: '24px', textAlign: 'center', opacity: isActive ? 1 : 0.8, display: 'flex', justifyContent: 'center' }}>
                                                {item.icon}
                                            </span>
                                            {!isCollapsed && <span style={{ whiteSpace: 'nowrap', flex: 1 }}>{item.label}</span>}
                                            {!isCollapsed && item.count > 0 && (
                                                <span style={{
                                                    background: isActive ? 'white' : '#EF4444',
                                                    color: isActive ? '#D97706' : 'white',
                                                    minWidth: '20px', height: '20px', borderRadius: '10px',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: '0.7rem', fontWeight: 900, padding: '0 6px'
                                                }}>
                                                    {item.count}
                                                </span>
                                            )}
                                        </li>
                                    )
                                })}
                            </ul>
                        </nav>

                        {/* Footer User Profile (Sidebar) - PROFESSIONAL REDESIGN */}
                        <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)', background: '#FFF7ED' }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                background: 'white',
                                padding: isCollapsed ? '8px' : '12px',
                                borderRadius: '16px',
                                border: '1px solid var(--border-color)',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                                transition: 'all 0.2s',
                                justifyContent: isCollapsed ? 'center' : 'flex-start',
                                cursor: 'pointer'
                            }}
                                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                                onClick={() => handleNavClick('profile')}
                            >
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '12px',
                                    background: 'linear-gradient(135deg, var(--primary-blue) 0%, var(--primary-blue-dark) 100%)',
                                    overflow: 'hidden',
                                    flexShrink: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                                    border: '2px solid white'
                                }}>
                                    {user.profile_photo ? (
                                        <img src={user.profile_photo} alt="P" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <ProfileIcon size={20} color="white" />
                                    )}
                                </div>
                                {!isCollapsed && (
                                    <div style={{ overflow: 'hidden', flex: 1 }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {user.name}
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <ShieldCheck size={12} color="var(--primary-blue)" />
                                            {getRoleLabel(user)}
                                        </div>
                                    </div>
                                )}
                                {!isCollapsed && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleLogout(); }}
                                        style={{
                                            background: '#FEF2F2',
                                            border: 'none',
                                            cursor: 'pointer',
                                            padding: '8px',
                                            borderRadius: '8px',
                                            color: 'var(--danger)',
                                            display: 'flex',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseOver={e => e.currentTarget.style.background = '#FEE2E2'}
                                        onMouseOut={e => e.currentTarget.style.background = '#FEF2F2'}
                                        title="Logout"
                                    >
                                        <LogOut size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </aside>

                    {/* MAIN CONTENT AREA */}
                    <div style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'all 0.3s ease',
                        overflow: 'hidden'
                    }}>
                        {banner}
                        <main style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-page)' }}>
                            <div style={{ padding: '30px' }}>
                                <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
                                    {showTitle && (
                                        <div style={{ marginBottom: '20px' }}>
                                            <h1 style={{ margin: 0, fontSize: '1.6rem', color: 'var(--primary-blue)', fontWeight: 800 }}>
                                                {[...sidebarItems, ...headerItems].find(i => (i.tab || 'overview') === activeTab)?.label.replace(/ .*/, '') || 'Dashboard'}
                                            </h1>
                                        </div>
                                    )}
                                    {children}
                                </div>
                            </div>
                        </main>
                    </div>

                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-gradient)', fontFamily: "'Inter', sans-serif" }}>
            {/* Top Navigation Bar */}
            <header style={{
                background: 'var(--bg-card)',
                boxShadow: '0 4px 20px -5px rgba(0,0,0,0.1)',
                zIndex: 1000,
                borderBottom: '1px solid var(--border-color)',
                position: 'sticky',
                top: 0
            }}>
                <div style={{
                    padding: isMobile ? '10px 15px' : '10px 30px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    height: '70px'
                }}>
                    {/* Logo & Brand */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '10px' : '15px' }}>
                        <div onClick={() => navigate(basePath)} style={{ width: '40px', height: '40px', background: 'var(--primary-blue)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: '1.2rem', flexShrink: 0, cursor: 'pointer' }}>J</div>
                        <div onClick={() => navigate(basePath)} style={{ cursor: 'pointer' }}>
                            <h2 style={{ margin: 0, color: 'var(--primary-blue)', fontSize: '1.1rem', fontWeight: 800, lineHeight: 1 }}>Jagdamba</h2>
                            {!isMobile && <small style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Management Portal</small>}
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    {!isMobile && (
                        <nav style={{ flex: 1, margin: '0 40px', display: 'flex', justifyContent: 'center' }}>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap', justifyContent: 'center' }}>
                                {(user.role === 'family_head' && (user.status === 'Profile Incomplete' || user.status === 'Pending')) && (
                                    <li style={{ color: 'var(--danger)', fontWeight: 800, fontSize: '0.8rem', background: '#FEF2F2', padding: '5px 15px', borderRadius: '15px', marginRight: '10px' }}>
                                        ⚠️ {user.status === 'Profile Incomplete' ? 'Complete Profile' : 'Pending Approval'}
                                    </li>
                                )}
                                {mobileMenuItems.map((item, idx) => {
                                    const isActive = activeTab === (item.tab || 'overview');
                                    if (item.tab === 'overview') return null;

                                    return (
                                        <li
                                            key={idx}
                                            onClick={() => handleNavClick(item.tab)}
                                            style={{
                                                padding: '8px 14px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                color: isActive ? 'white' : 'var(--text-main)',
                                                background: isActive ? 'var(--primary-blue)' : 'transparent',
                                                borderRadius: '8px',
                                                transition: 'all 0.2s',
                                                fontWeight: isActive ? 600 : 500,
                                                fontSize: '0.9rem',
                                                whiteSpace: 'nowrap'
                                            }}
                                            onMouseOver={(e) => {
                                                if (!isActive) e.currentTarget.style.background = 'var(--bg-hover)';
                                            }}
                                            onMouseOut={(e) => {
                                                if (!isActive) e.currentTarget.style.background = 'transparent';
                                            }}
                                        >
                                            <span style={{ fontSize: '1rem' }}>{item.icon}</span>
                                            {item.label.replace(/ .*/, '')}
                                        </li>
                                    );
                                })}
                            </ul>
                        </nav>
                    )}

                    {/* Right Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <button
                            onClick={toggleLanguage}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                padding: '8px 16px',
                                borderRadius: '20px',
                                border: '1px solid var(--border-color)',
                                background: 'var(--bg-page)',
                                color: 'var(--text-main)',
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: '0.85rem',
                                transition: 'all 0.2s'
                            }}
                        >
                            <Globe size={16} />
                            {!isMobile && <span>{language === 'en' ? 'English' : 'हिंदी'}</span>}
                        </button>

                        {!isMobile && (
                            <div
                                onClick={() => handleNavClick('profile')}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '15px',
                                    background: 'var(--bg-page)', padding: '5px 15px', borderRadius: '50px',
                                    border: '1px solid var(--border-color)', cursor: 'pointer', transition: 'all 0.2s'
                                }}
                                onMouseOver={e => e.currentTarget.style.transform = 'scale(1.02)'}
                                onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                                title="Go to Profile"
                            >
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.85rem' }}>{user.name.split(' ')[0]}</div>
                                </div>
                                <div style={{ width: '30px', height: '30px', background: 'var(--primary-blue)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.8rem', overflow: 'hidden' }}>
                                    {user.profile_photo ? <img src={user.profile_photo} alt="P" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : user.name.charAt(0)}
                                </div>
                            </div>
                        )}

                        {isMobile && (
                            <button
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-main)' }}
                            >
                                ☰
                            </button>
                        )}

                        <button
                            onClick={handleLogout}
                            title="Logout"
                            style={{
                                width: '36px', height: '36px',
                                background: '#FEE2E2',
                                color: 'var(--danger)',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                        >
                            🔒
                        </button>
                    </div>
                </div>

                {isMobile && isSidebarOpen && (
                    <div style={{
                        position: 'absolute', top: '70px', left: 0, right: 0,
                        background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)',
                        padding: '20px', boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                        display: 'flex', flexDirection: 'column', gap: '10px'
                    }}>
                        {(user.role === 'family_head' && (user.status === 'Profile Incomplete' || user.status === 'Pending')) && (
                            <div style={{ padding: '10px 20px', textAlign: 'center', color: 'var(--danger)', fontWeight: 700, background: '#FEF2F2', borderRadius: '8px', marginBottom: '10px', fontSize: '0.85rem' }}>
                                ⚠️ Status: {user.status === 'Profile Incomplete' ? 'Profile Incomplete' : 'Under Review'}
                            </div>
                        )}
                        {mobileMenuItems.map((item, idx) => (
                            <div
                                key={idx}
                                onClick={() => handleNavClick(item.tab)}
                                style={{ padding: '12px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '10px', alignItems: 'center', cursor: 'pointer', background: activeTab === item.tab ? 'var(--bg-hover)' : 'transparent', borderRadius: '8px' }}
                            >
                                <span>{item.icon}</span> {item.label}
                            </div>
                        ))}
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, maxWidth: '1600px', width: '100%', margin: '0 auto' }}>
                <div style={{ padding: window.innerWidth <= 600 ? '15px' : '30px', flex: 1 }}>
                    {activeTab !== 'overview' && (
                        <button
                            onClick={() => navigate(basePath)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: '20px',
                                padding: '8px 16px',
                                borderRadius: '10px',
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border-color)',
                                color: 'var(--primary-blue)',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                            }}
                            onMouseOver={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                            onMouseOut={e => e.currentTarget.style.background = 'var(--bg-card)'}
                        >
                            <ArrowLeft size={18} />
                            Back to Dashboard
                        </button>
                    )}
                    {children}
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
