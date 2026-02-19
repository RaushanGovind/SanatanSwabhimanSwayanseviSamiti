import React, { useState, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { X, Menu, BookOpen, User, Settings, ArrowLeft, ArrowRight, Type } from 'lucide-react';
const MD_PLUGINS = [remarkGfm];

const RulesManager = ({ role }) => {
    const { language, setLanguage } = useLanguage();
    const navigate = useNavigate();
    const [rulesData, setRulesData] = useState({ current: { text_hi: '', text_en: '' }, history: [] });
    const [isEditing, setIsEditing] = useState(false);

    const DEFAULT_EN_RULES = `
Chapter 1: Preliminary
### 1.1 Short Title and Commencement
(i) These rules may be called the "Sanatan Swabhiman Samiti Constitution & Rules 2024".
(ii) They shall come into force on the date of their publication.

### 1.2 Definitions
In these rules, unless the context otherwise requires:
- "Society" means the Sanatan Swabhiman Samiti.
- "Member" means a registered member of the society.

Chapter 2: Membership
### 2.1 Eligibility
Any person who subscribes to the objects of the society and agrees to be bound by these rules shall be eligible for membership.

### 2.2 Rights and Obligations
Every member shall have the right to vote in the General Body meetings and shall be obligated to pay the prescribed subscription fees.

Chapter 3: Management
### 3.1 Governing Body
The management of the affairs of the society shall be entrusted to a Governing Body consisting of elected members.

### 3.2 Powers and Duties
The Governing Body shall have all powers necessary for the administration of the society, including the power to appoint committee members.
    `;

    const [editText, setEditText] = useState('');
    const [activeChapter, setActiveChapter] = useState(0);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Default open

    // Reader Settings
    const [fontSize, setFontSize] = useState(20); // Slightly larger default
    const [fontFamily, setFontFamily] = useState('serif'); // 'serif' | 'sans'
    const [theme, setTheme] = useState('sepia'); // 'light' | 'sepia' | 'dark'
    const [customTextColor, setCustomTextColor] = useState(null);

    const canEdit = ['admin', 'super_admin'].includes(role);

    useEffect(() => {
        // 1. Instant Load from Cache
        const cached = localStorage.getItem('rules_data_cache');
        if (cached) {
            try {
                setRulesData(JSON.parse(cached));
            } catch (e) {
                console.error("Cache parse error", e);
            }
        }

        // 2. Background Fetch
        fetchRules();

        // Lock body scroll
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'auto'; }
    }, []);

    useEffect(() => {
        const textKey = language === 'hi' ? 'text_hi' : 'text_en';
        const text = rulesData.current[textKey] || rulesData.current['text'] || '';
        setEditText(text);
        // Only reset chapter if it's the first load or explicit change, 
        // preventing jumpiness if background fetch updates same data
        if (!activeChapter) setActiveChapter(0);
    }, [rulesData, language]);

    const fetchRules = async () => {
        try {
            const res = await api.getRules();
            // Only update if data changed (simple check or always update)
            setRulesData(res.data);
            localStorage.setItem('rules_data_cache', JSON.stringify(res.data));
        } catch (err) {
            console.error("Failed to fetch rules", err);
        }
    };

    const handleSave = async () => {
        try {
            const textKey = language === 'hi' ? 'text_hi' : 'text_en';
            const updatedCurrent = {
                ...rulesData.current,
                [textKey]: editText
            };
            const res = await api.updateRules(updatedCurrent);
            setRulesData(res.data);
            localStorage.setItem('rules_data_cache', JSON.stringify(res.data));
            setIsEditing(false);
        } catch (err) {
            console.error("Failed to save rules", err);
            alert("Failed to save rules");
        }
    };

    const handleClose = () => {
        const segments = window.location.pathname.split('/');
        const basePath = `/${segments[1] || 'admin'}`;
        navigate(basePath);
    };

    const extractChapters = (text) => {
        if (!text) return [];
        const lines = text.split('\n');
        const chapters = [];
        let currentChapter = null;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.match(/^(Chapter|अध्याय)\s+\d+/i)) {
                if (currentChapter) chapters.push(currentChapter);
                let title = line;
                let potentialTitle = lines[i + 1]?.trim();
                if (potentialTitle && !potentialTitle.startsWith('#') && potentialTitle.length > 0) {
                    title = `${line}: ${potentialTitle.replace(/\*\*/g, '')}`;
                }
                currentChapter = { title: title, content: '', id: i, subSections: [] };
            } else if (currentChapter) {
                // Capture Sub-sections (###)
                const subMatch = line.match(/^###\s+(.*)/);
                if (subMatch) {
                    currentChapter.subSections.push({ title: subMatch[1], lineIndex: i });
                }
                currentChapter.content += line + '\n';
            }
        }
        if (currentChapter) chapters.push(currentChapter);
        return chapters.length > 0 ? chapters : [{ title: (language === 'hi' ? 'पूर्ण दस्तावेज़' : 'Full Document'), content: text, id: 0 }];
    };

    // Optimized: Memoize active text calculation
    const activeText = useMemo(() => {
        return isEditing ? editText : (
            language === 'hi'
                ? (rulesData.current.text_hi || rulesData.current.text || '')
                : (rulesData.current.text_en || DEFAULT_EN_RULES)
        );
    }, [isEditing, editText, language, rulesData]);

    // Optimized: Memoize chapter parsing (Heavy Operation)
    const chapters = useMemo(() => {
        if (!isEditing && rulesData.current?.structured && rulesData.current.structured.length > 0) {
            return rulesData.current.structured.map((chap, idx) => ({
                id: chap.chapter_id || idx,
                title: `Chapter ${chap.chapter_id}: ${chap.title}`,
                subSections: chap.sections.map(sec => ({ title: `${sec.section_id} ${sec.title}` })),
                content: chap.sections.map(sec => `### ${sec.section_id} ${sec.title}\n\n${sec.content}`).join('\n\n<div class="separator">✻ ✻ ✻</div>\n\n')
            }));
        } else {
            return extractChapters(activeText);
        }
    }, [isEditing, rulesData, activeText, language]); // Only re-parse if data changes

    // --- Theming Styles ---
    const themes = {
        light: { bg: '#fdfdfd', paper: '#ffffff', text: '#2c3e50', border: '#e0e0e0', sidebar: '#f8f9fa', accent: '#3b82f6' },
        sepia: { bg: '#f4ecd8', paper: '#fbf0d9', text: '#5b4636', border: '#dccca8', sidebar: '#eaddc5', accent: '#8c4b26' }, // Classic Book
        dark: { bg: '#111111', paper: '#1e1e1e', text: '#d4d4d4', border: '#333333', sidebar: '#181818', accent: '#fbbf24' }
    };
    const currentTheme = themes[theme];

    // Font Options
    const fontOptions = [
        // English Fonts
        { name: 'Merriweather', label: 'Merriweather (Serif)', type: 'serif', lang: 'en' },
        { name: 'Inter', label: 'Inter (Sans)', type: 'sans', lang: 'en' },
        { name: 'Roboto Slab', label: 'Roboto Slab', type: 'serif', lang: 'en' },
        { name: 'Lora', label: 'Lora (Elegant)', type: 'serif', lang: 'en' },
        { name: 'Poppins', label: 'Poppins (Modern)', type: 'sans', lang: 'en' },
        { name: 'Playfair Display', label: 'Playfair (Classic)', type: 'serif', lang: 'en' },
        { name: 'Nunito', label: 'Nunito (Round)', type: 'sans', lang: 'en' },
        { name: 'Crimson Text', label: 'Crimson (Old Style)', type: 'serif', lang: 'en' },

        // Hindi Fonts
        { name: 'Mukta', label: 'Mukta (Hindi Optimal)', type: 'sans', lang: 'hi' },
        { name: 'Noto Sans Devanagari', label: 'Noto Sans (Hindi)', type: 'sans', lang: 'hi' },
        { name: 'Noto Serif Devanagari', label: 'Noto Serif (Hindi)', type: 'serif', lang: 'hi' },
        { name: 'Poppins', label: 'Poppins (Universal)', type: 'sans', lang: 'hi' },
        { name: 'Gotu', label: 'Gotu (Calligraphic)', type: 'sans', lang: 'hi' },
        { name: 'Kalam', label: 'Kalam (Handwriting)', type: 'hand', lang: 'hi' },
        { name: 'Teko', label: 'Teko (Geometric)', type: 'sans', lang: 'hi' },
        { name: 'Hind', label: 'Hind (Clean)', type: 'sans', lang: 'hi' }
    ];

    const toggleLanguage = (lang) => {
        setLanguage(lang);
    };

    const [activeTab, setActiveTab] = useState('chapters'); // 'chapters', 'search'
    const [searchQuery, setSearchQuery] = useState('');
    const [showSettings, setShowSettings] = useState(false);

    const handleScrollToSection = (title) => {
        const cleanTitle = title.replace(/\*\*/g, '').trim();
        // Try to find the heading in the rendered markdown
        const headings = document.querySelectorAll('.markdown-content h3');
        for (let h of headings) {
            // Check if heading text contains the title (or significant part of it)
            if (h.innerText.includes(cleanTitle.split(' ')[0]) || h.innerText.includes(cleanTitle)) {
                h.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Briefly highlight
                h.style.backgroundColor = currentTheme.accent + '20';
                h.style.transition = 'background-color 0.5s';
                setTimeout(() => {
                    h.style.backgroundColor = 'transparent';
                }, 1500);
                break;
            }
        }
    };

    // ... (rest of initial implementation)

    return (
        <div style={{
            position: 'fixed', inset: 0, width: '100vw', height: '100vh', zIndex: 2000,
            background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px', animation: 'fadeIn 0.2s ease-out'
        }}>

            <div style={{
                width: '100%', maxWidth: '1200px', height: '90vh',
                background: currentTheme.bg, color: currentTheme.text,
                borderRadius: '24px', overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
                display: 'flex', flexDirection: 'column',
                position: 'relative', border: `1px solid ${currentTheme.border}`
            }}>

                {/* Top Navigation Bar */}
                <header style={{
                    height: '60px', padding: '0 15px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    borderBottom: `1px solid ${currentTheme.border}`,
                    background: currentTheme.paper, boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                    zIndex: 10, gap: '10px'
                }}>
                    {/* Left: Menu & Title */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={{ background: 'transparent', border: 'none', color: currentTheme.text, cursor: 'pointer', padding: '4px', borderRadius: '50%', display: 'flex', flexShrink: 0 }}>
                            <Menu size={24} />
                        </button>
                        <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: currentTheme.text }}>
                            <BookOpen size={20} color={currentTheme.accent} style={{ flexShrink: 0 }} />
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {language === 'hi' ? 'नियमावली' : 'Rules'}
                            </span>
                        </h2>
                    </div>

                    {/* Right: Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                        {/* Language Toggle */}
                        <div style={{ display: 'flex', background: currentTheme.sidebar, padding: '3px', borderRadius: '8px', border: `1px solid ${currentTheme.border}` }}>
                            <button onClick={() => toggleLanguage('hi')} style={{ padding: '4px 8px', borderRadius: '6px', border: 'none', background: language === 'hi' ? currentTheme.accent : 'transparent', color: language === 'hi' ? '#fff' : currentTheme.text, fontWeight: 700, cursor: 'pointer', fontSize: '0.75rem', transition: 'all 0.2s' }}>हिन्दी</button>
                            <button onClick={() => toggleLanguage('en')} style={{ padding: '4px 8px', borderRadius: '6px', border: 'none', background: language === 'en' ? currentTheme.accent : 'transparent', color: language === 'en' ? '#fff' : currentTheme.text, fontWeight: 700, cursor: 'pointer', fontSize: '0.75rem', transition: 'all 0.2s' }}>Eng</button>
                        </div>

                        {/* Settings Dropdown & Close */}
                        <div style={{ position: 'relative', display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button onClick={() => setShowSettings(!showSettings)} style={{ background: showSettings ? currentTheme.sidebar : 'transparent', border: 'none', color: currentTheme.text, cursor: 'pointer', padding: '6px', borderRadius: '8px', display: 'flex' }}>
                                <Settings size={20} />
                            </button>

                            {showSettings && (
                                <>
                                    {/* Backdrop to close on click outside */}
                                    <div
                                        onClick={() => setShowSettings(false)}
                                        style={{ position: 'fixed', inset: 0, zIndex: 99, cursor: 'default' }}
                                    />

                                    <div style={{
                                        position: 'absolute', top: '120%', right: '-10px', width: '300px',
                                        background: currentTheme.paper, borderRadius: '16px',
                                        padding: '20px', border: `1px solid ${currentTheme.border}`,
                                        boxShadow: '0 20px 40px rgba(0,0,0,0.2)', zIndex: 100
                                    }}>
                                        {/* Settings Content Same as Before */}
                                        <h4 style={{ margin: '0 0 20px 0', fontSize: '0.95rem', color: currentTheme.text, opacity: 0.8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            Reading Preferences
                                            <button onClick={() => setShowSettings(false)} style={{ background: 'transparent', border: 'none', color: currentTheme.text, opacity: 0.5, cursor: 'pointer' }}><X size={16} /></button>
                                        </h4>

                                        <div style={{ marginBottom: '25px' }}>
                                            <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '10px', fontWeight: 600, opacity: 0.7 }}>TEXT SIZE ({fontSize}px)</label>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: currentTheme.sidebar, padding: '5px', borderRadius: '10px' }}>
                                                <button onClick={() => setFontSize(f => Math.max(14, f - 2))} style={{ flex: 1, height: '36px', border: 'none', background: 'transparent', cursor: 'pointer', color: currentTheme.text, display: 'grid', placeItems: 'center' }}><Type size={14} /></button>
                                                <div style={{ width: '1px', height: '20px', background: currentTheme.border }}></div>
                                                <button onClick={() => setFontSize(f => Math.min(32, f + 2))} style={{ flex: 1, height: '36px', border: 'none', background: 'transparent', cursor: 'pointer', color: currentTheme.text, display: 'grid', placeItems: 'center' }}><Type size={22} /></button>
                                            </div>
                                        </div>

                                        <div style={{ marginBottom: '25px' }}>
                                            <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '10px', fontWeight: 600, opacity: 0.7 }}>FONT FACE</label>
                                            <div className="custom-scroll" style={{ maxHeight: '180px', overflowY: 'auto', background: currentTheme.sidebar, borderRadius: '10px', border: `1px solid ${currentTheme.border}` }}>
                                                {fontOptions.filter(f => f.lang === language).map(font => (
                                                    <button key={font.name}
                                                        onClick={() => setFontFamily(font.name)}
                                                        style={{
                                                            width: '100%', textAlign: 'left', padding: '12px 16px', border: 'none',
                                                            background: fontFamily === font.name ? currentTheme.accent : 'transparent',
                                                            color: fontFamily === font.name ? '#fff' : currentTheme.text,
                                                            fontFamily: font.name + ', sans-serif', fontSize: '1rem',
                                                            cursor: 'pointer', borderBottom: `1px solid ${currentTheme.border}40`,
                                                            transition: 'all 0.1s'
                                                        }}
                                                    >
                                                        {font.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div style={{ marginBottom: '25px' }}>
                                            <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '10px', fontWeight: 600, opacity: 0.7 }}>TEXT COLOR</label>
                                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                {/* Reset Button */}
                                                <button
                                                    onClick={() => setCustomTextColor(null)}
                                                    style={{
                                                        padding: '6px 10px', fontSize: '0.75rem', borderRadius: '8px', border: `1px solid ${currentTheme.border}`,
                                                        background: customTextColor === null ? currentTheme.accent : 'transparent',
                                                        color: customTextColor === null ? '#fff' : currentTheme.text,
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    Auto
                                                </button>
                                                {/* Text Color Swatches */}
                                                {['#000000', '#374151', '#4b5563', '#1e3a8a', '#1e40af', '#7f1d1d', '#92400e', '#166534'].map(color => (
                                                    <button key={color}
                                                        onClick={() => setCustomTextColor(color)}
                                                        style={{
                                                            width: '28px', height: '28px', borderRadius: '50%',
                                                            background: color, border: customTextColor === color ? `2px solid ${currentTheme.accent}` : '2px solid rgba(0,0,0,0.1)',
                                                            cursor: 'pointer', transform: customTextColor === color ? 'scale(1.1)' : 'scale(1)', transition: 'all 0.2s'
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        <div style={{ marginBottom: '10px' }}>
                                            <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '10px', fontWeight: 600, opacity: 0.7 }}>COLOR THEME</label>
                                            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                                                {['light', 'sepia', 'dark'].map(t => (
                                                    <button key={t} onClick={() => setTheme(t)} style={{
                                                        width: '48px', height: '48px', borderRadius: '50%', border: `3px solid ${theme === t ? currentTheme.accent : themes[t].border}`,
                                                        background: themes[t].bg, cursor: 'pointer', display: 'grid', placeItems: 'center',
                                                        transform: theme === t ? 'scale(1.1)' : 'scale(1)', transition: 'all 0.2s'
                                                    }}>
                                                        {theme === t && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: currentTheme.accent }}></div>}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            <div style={{ width: '1px', height: '24px', background: currentTheme.border }}></div>

                            <button onClick={handleClose}
                                style={{ background: 'transparent', border: 'none', color: currentTheme.text, cursor: 'pointer', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>
                </header>

                <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>

                    {/* Mobile Sidebar Backdrop */}
                    <div
                        className="mobile-backdrop"
                        onClick={() => setIsSidebarOpen(false)}
                        style={{
                            position: 'absolute', inset: 0, zIndex: 4,
                            background: 'rgba(0,0,0,0.4)',
                            backdropFilter: 'blur(2px)',
                            opacity: isSidebarOpen ? 1 : 0,
                            pointerEvents: isSidebarOpen ? 'auto' : 'none',
                            transition: 'opacity 0.3s ease'
                        }}
                    />

                    {/* Collapsible Sidebar with Sub-tabs */}
                    <aside style={{
                        width: '300px', height: '100%',
                        background: currentTheme.sidebar,
                        borderRight: `1px solid ${currentTheme.border}`,
                        position: 'absolute', left: 0, top: 0, bottom: 0,
                        transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-300px)',
                        transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                        zIndex: 5,
                        display: 'flex', flexDirection: 'column'
                    }}>
                        {/* Sidebar Tabs */}
                        <div style={{ display: 'flex', borderBottom: `1px solid ${currentTheme.border}` }}>
                            <button onClick={() => setActiveTab('chapters')} style={{ flex: 1, padding: '15px', background: 'transparent', border: 'none', borderBottom: `2px solid ${activeTab === 'chapters' ? currentTheme.accent : 'transparent'}`, color: activeTab === 'chapters' ? currentTheme.text : currentTheme.text + '80', fontWeight: 600, cursor: 'pointer' }}>Chapters</button>
                            <button onClick={() => setActiveTab('search')} style={{ flex: 1, padding: '15px', background: 'transparent', border: 'none', borderBottom: `2px solid ${activeTab === 'search' ? currentTheme.accent : 'transparent'}`, color: activeTab === 'search' ? currentTheme.text : currentTheme.text + '80', fontWeight: 600, cursor: 'pointer' }}>Search</button>
                        </div>

                        {activeTab === 'chapters' ? (
                            <>
                                <div style={{ padding: '15px 25px', borderBottom: `1px solid ${currentTheme.border}`, background: currentTheme.bg }}>
                                    <h4 style={{ margin: 0, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1.5px', opacity: 0.6 }}>Table of Contents</h4>
                                </div>
                                <div className="custom-scroll" style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
                                    {chapters.map((chap, idx) => (
                                        <div key={idx}>
                                            <div
                                                onClick={() => setActiveChapter(idx)}
                                                style={{
                                                    padding: '12px 20px', cursor: 'pointer', borderRadius: '12px',
                                                    background: activeChapter === idx ? currentTheme.paper : 'transparent',
                                                    color: activeChapter === idx ? currentTheme.accent : currentTheme.text,
                                                    fontWeight: activeChapter === idx ? 700 : 500,
                                                    border: activeChapter === idx ? `1px solid ${currentTheme.border}` : 'none',
                                                    boxShadow: activeChapter === idx ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                                                    marginBottom: '4px',
                                                    fontSize: '0.9rem',
                                                    transition: 'all 0.2s',
                                                    opacity: activeChapter === idx ? 1 : 0.8,
                                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                                }}
                                            >
                                                {chap.title.replace(/\*\*/g, '')}
                                                {activeChapter === idx && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: currentTheme.accent }}></div>}
                                            </div>

                                            {/* Sub-sections Rendering (only for active chapter) */}
                                            {activeChapter === idx && chap.subSections && chap.subSections.length > 0 && (
                                                <div style={{ marginLeft: '15px', paddingLeft: '15px', borderLeft: `2px solid ${currentTheme.border}`, marginBottom: '10px' }}>
                                                    {chap.subSections.map((sub, sIdx) => (
                                                        <div key={sIdx}
                                                            className="subsection-item"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleScrollToSection(sub.title);
                                                            }}
                                                            style={{
                                                                padding: '6px 8px', fontSize: '0.85rem', color: currentTheme.text, opacity: 0.7,
                                                                cursor: 'pointer',
                                                                display: 'flex', alignItems: 'center', gap: '8px',
                                                                transition: 'all 0.2s', margin: '2px 0'
                                                            }}
                                                        >
                                                            <div style={{ width: '4px', height: '4px', background: currentTheme.text, borderRadius: '50%', opacity: 0.5 }}></div>
                                                            {sub.title.replace(/\*\*/g, '')}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ padding: '15px', borderBottom: `1px solid ${currentTheme.border}`, background: currentTheme.bg }}>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder={language === 'hi' ? "खोजें..." : "Search..."}
                                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: `1px solid ${currentTheme.border}`, background: currentTheme.paper, color: currentTheme.text, outline: 'none' }}
                                    />
                                </div>
                                <div className="custom-scroll" style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
                                    {searchQuery.trim() === '' ? (
                                        <div style={{ textAlign: 'center', padding: '20px', opacity: 0.5, fontSize: '0.9rem' }}>
                                            {language === 'hi' ? "खोजने के लिए टाइप करें" : "Type to search"}
                                        </div>
                                    ) : (
                                        (() => {
                                            const results = chapters.filter(chap =>
                                                chap.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                chap.content.toLowerCase().includes(searchQuery.toLowerCase())
                                            );

                                            if (results.length === 0) {
                                                return (
                                                    <div style={{ textAlign: 'center', padding: '20px', opacity: 0.5 }}>
                                                        {language === 'hi' ? "कोई परिणाम नहीं मिला" : "No results found"}
                                                    </div>
                                                );
                                            }

                                            return results.map((chap, idx) => (
                                                <div key={idx}
                                                    onClick={() => setActiveChapter(chapters.findIndex(c => c.id === chap.id) !== -1 ? chapters.findIndex(c => c.id === chap.id) : idx)}
                                                    style={{
                                                        padding: '12px', cursor: 'pointer', borderRadius: '8px',
                                                        background: 'transparent',
                                                        borderBottom: `1px solid ${currentTheme.border}40`,
                                                        marginBottom: '4px',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: currentTheme.text }}>{chap.title.replace(/\*\*/g, '')}</div>
                                                    <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '4px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                                                        {chap.content ? chap.content.substring(0, 60).replace(/[#*]/g, '') : ''}...
                                                    </div>
                                                </div>
                                            ));
                                        })()
                                    )}
                                </div>
                            </div>
                        )}

                        {canEdit && (
                            <div style={{ padding: '20px', borderTop: `1px solid ${currentTheme.border}`, background: currentTheme.bg }}>
                                <button onClick={() => setIsEditing(!isEditing)} style={{ width: '100%', padding: '12px', background: currentTheme.accent, color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 700 }}>
                                    {isEditing ? 'Exit Editor' : 'Edit Rules Document'}
                                </button>
                            </div>
                        )}
                    </aside>

                    {/* Main Content Area */}
                    <main className="custom-scroll rules-main-container" style={{
                        flex: 1,
                        marginLeft: isSidebarOpen ? '300px' : '0',
                        transition: 'margin-left 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        overflowY: 'auto',
                        padding: '40px',
                        transform: 'translateZ(0)', // Force GPU layer
                        willChange: 'scroll-position'
                    }}>
                        {isEditing ? (
                            <div style={{ width: '100%', maxWidth: '800px', height: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <textarea
                                    value={editText} onChange={(e) => setEditText(e.target.value)}
                                    style={{ flex: 1, padding: '25px', fontSize: '1rem', fontFamily: 'monospace', border: 'none', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', resize: 'none' }}
                                />
                                <button onClick={handleSave} style={{ padding: '15px', background: '#22c55e', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}>
                                    Save Changes & Publish
                                </button>
                            </div>
                        ) : (
                            <div className="rules-paper-content" style={{
                                width: '100%',
                                maxWidth: '850px',
                                background: currentTheme.paper,
                                minHeight: '100%',
                                height: 'auto',
                                padding: '60px 80px',
                                boxShadow: theme === 'dark' ? '0 0 50px rgba(0,0,0,0.5)' : '0 10px 40px rgba(0,0,0,0.06)',
                                borderRadius: '4px',
                                marginBottom: '40px',
                                position: 'relative',
                                flexShrink: 0,
                                contentVisibility: 'auto' // Render performance optimization
                            }}>
                                {chapters.length > 0 ? (
                                    <>
                                        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                                            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', color: currentTheme.accent, fontWeight: 700, marginBottom: '10px' }}>
                                                {language === 'hi' ? 'अनुभाग' : 'SECTION'} {activeChapter + 1}
                                            </div>
                                            <h1 style={{ fontSize: '2.5rem', fontFamily: `${fontFamily}, sans-serif`, fontWeight: 900, margin: 0, lineHeight: 1.2, color: customTextColor || currentTheme.text }}>
                                                {chapters[activeChapter].title.replace(/\*\*/g, '').split(':').pop().trim()}
                                            </h1>
                                            <div style={{ width: '40px', height: '4px', background: currentTheme.accent, margin: '25px auto 0' }}></div>
                                        </div>

                                        <div className={`markdown-content`} style={{ fontFamily: `${fontFamily}, sans-serif`, fontSize: `${fontSize}px`, lineHeight: 1.8, textAlign: 'justify', color: customTextColor || currentTheme.text }}>
                                            <ReactMarkdown remarkPlugins={MD_PLUGINS} rehypePlugins={[]}>
                                                {chapters[activeChapter].content}
                                            </ReactMarkdown>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '80px', paddingTop: '40px', borderTop: `1px solid ${currentTheme.border}` }}>
                                            <button
                                                onClick={() => document.querySelector('main').scrollTo({ top: 0, behavior: 'smooth' }) || setTimeout(() => setActiveChapter(c => c - 1), 10)}
                                                disabled={activeChapter === 0}
                                                style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'transparent', border: 'none', color: activeChapter === 0 ? 'transparent' : currentTheme.text, cursor: 'pointer', opacity: 0.6, fontSize: '1rem', fontWeight: 600 }}
                                            >
                                                <ArrowLeft size={20} /> Preview Chapter
                                            </button>
                                            <button
                                                onClick={() => document.querySelector('main').scrollTo({ top: 0, behavior: 'smooth' }) || setTimeout(() => setActiveChapter(c => c + 1), 10)}
                                                disabled={activeChapter === chapters.length - 1}
                                                style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'transparent', border: 'none', color: activeChapter === chapters.length - 1 ? 'transparent' : currentTheme.text, cursor: 'pointer', fontSize: '1.1rem', fontWeight: 700 }}
                                            >
                                                Next Chapter <ArrowRight size={20} />
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px', color: currentTheme.text, opacity: 0.5 }}>
                                        Loading Document...
                                    </div>
                                )}
                            </div>
                        )}
                    </main>
                </div>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;0,700;1,400&family=Gotu&family=Hind:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&family=Kalam:wght@300;400;700&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Merriweather:ital,wght@0,300;0,400;0,700;0,900;1,400&family=Mukta:wght@300;400;500;600;700;800&family=Noto+Sans+Devanagari:wght@300;400;500;600;700&family=Noto+Serif+Devanagari:wght@300;400;500;600;700&family=Nunito:ital,wght@0,300;0,400;0,600;0,700;1,400&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400&family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Roboto+Slab:wght@300;400;500;600;700&family=Teko:wght@300;400;500;600;700&display=swap');
                
                @keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
                
                .markdown-content strong { font-weight: 800; color: ${currentTheme.accent}; }
                .markdown-content h3 { font-size: 1.5rem; margin-top: 2em; margin-bottom: 0.8em; font-weight: 800; }
                .markdown-content ul { padding-left: 20px; }
                .markdown-content li { margin-bottom: 0.5em; }
                
                .separator { text-align: center; margin: 40px 0; font-size: 1.5rem; color: ${currentTheme.accent}; opacity: 0.6; pointer-events: none; }
                
                .custom-scroll::-webkit-scrollbar { width: 8px; }
                .custom-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 4px; transition: background 0.2s; }
                .custom-scroll::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.25); }
                .custom-scroll::-webkit-scrollbar-track { background: transparent; }

                .subsection-item:hover { color: ${currentTheme.accent} !important; opacity: 1 !important; background: rgba(128,128,128,0.1); border-radius: 6px; }

                .mobile-backdrop { display: none; }

                /* Mobile Optimizations */
                @media (max-width: 768px) {
                    .mobile-backdrop { display: block; }
                    .rules-main-container {
                        padding: 10px !important;
                        margin-left: 0 !important;
                    }
                    .rules-paper-content {
                        padding: 30px 20px !important;
                        min-height: 80vh !important;
                    }
                    .markdown-content h1 {
                        font-size: 2rem !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default RulesManager;
