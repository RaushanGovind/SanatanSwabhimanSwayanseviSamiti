
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { api } from '../services/api';

const DateInput = ({ value, onChange, placeholder, className, style }) => {
    const [inputType, setInputType] = useState('text');

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const [year, month, day] = dateString.split('-');
        return `${day}-${month}-${year}`;
    };

    return (
        <input
            className={className}
            style={style}
            type={inputType}
            placeholder={placeholder || "DD-MM-YYYY"}
            value={inputType === 'text' ? formatDate(value) : value}
            onFocus={() => setInputType('date')}
            onBlur={() => setInputType('text')}
            onChange={onChange}
            lang="en-GB" // Forces DD/MM/YYYY format in many browsers
        />
    );
};

const COUNTRIES = [
    "India", "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea, North", "Korea, South", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

const SearchableSelect = ({ value, onChange, options, placeholder, isPinLoading }) => {
    const [search, setSearch] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const filteredOptions = options.filter(opt =>
        opt.toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => {
        if (!isOpen) setSearch('');
    }, [isOpen]);

    return (
        <div style={{ position: 'relative', width: '100%' }}>
            <div
                className="form-input"
                onClick={() => setIsOpen(!isOpen)}
                style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
                {value || placeholder}
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{isOpen ? '▲' : '▼'}</span>
            </div>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    zIndex: 1000,
                    background: 'white',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    marginTop: '5px',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    maxHeight: '200px',
                    overflowY: 'auto'
                }}>
                    <input
                        className="form-input"
                        autoFocus
                        placeholder="Search country..."
                        style={{ border: 'none', borderRadius: 0, borderBottom: '1px solid var(--border)', sticky: 'top' }}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onClick={e => e.stopPropagation()}
                    />
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map(opt => (
                            <div
                                key={opt}
                                style={{ padding: '14px 15px', cursor: 'pointer' }}
                                onMouseDown={() => {
                                    onChange(opt);
                                    setIsOpen(false);
                                }}
                                onMouseEnter={e => e.target.style.background = 'var(--bg-light)'}
                                onMouseLeave={e => e.target.style.background = 'white'}
                            >
                                {opt}
                            </div>
                        ))
                    ) : (
                        <div style={{ padding: '10px 15px', color: 'var(--text-muted)' }}>No country found</div>
                    )}
                </div>
            )}
        </div>
    );
};

const PREFIX_OPTIONS = [
    { value: 'Shri', hi: 'श्री', en: 'Shri' },
    { value: 'Shrimati', hi: 'श्रीमती', en: 'Shrimati' },
    { value: 'Smt', hi: 'श्रीमती', en: 'Smt' },
    { value: 'Late', hi: 'स्व.', en: 'Late' },
    { value: 'Mr', hi: 'मि.', en: 'Mr' },
    { value: 'Mrs', hi: 'मिसेज', en: 'Mrs' },
    { value: 'Ms', hi: 'सुश्री', en: 'Ms' },
    { value: 'Dr', hi: 'डॉ.', en: 'Dr' },
    { value: 'Master', hi: 'मास्टर', en: 'Master' },
    { value: 'Miss', hi: 'मिस', en: 'Miss' },
    { value: 'Kumari', hi: 'कुमारी', en: 'Kumari' },
    { value: 'Km', hi: 'कु.', en: 'Km' },
    { value: 'Sh', hi: 'श्री', en: 'Sh' }
];

const RegisterFamily = ({ isEmbedded = false, onSuccess }) => {
    const [step, setStep] = useState(isEmbedded ? 1 : 0);
    const [language, setLanguage] = useState('en');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [recommenderInfo, setRecommenderInfo] = useState(null);
    const [token, setToken] = useState(null);
    const [isPinLoading, setIsPinLoading] = useState(false);
    const [formOptions, setFormOptions] = useState({
        family_type: [],
        gender: [],
        marital_status: [],
        blood_group: [],
        relation: [],
        occupation: [],
        education_level: [],
        education_class: []
    });

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const response = await fetch('/api/metadata/options');
                const data = await response.json();
                if (data && typeof data === 'object') {
                    setFormOptions(prev => ({ ...prev, ...data }));
                }
            } catch (error) {
                console.error("Error fetching form options:", error);
            }
        };
        fetchOptions();
    }, []);

    const translations = {
        en: {
            title: "Complete Your Profile",
            aboutTitle: "About Jagdamba Samiti",
            aboutText1: "Jagdamba Samiti is a voluntary, non-profit mutual aid society formed to support families in times of distress.",
            aboutText2: "We are NOT an insurance provider. This is a community fund managed by members for members.",
            aboutText3: "Membership requires verifying details and committee approval.",
            iUnderstand: "I have read and understood the objectives.",
            proceedBtn: "Proceed to Registration",
            step1: "Head Information",
            step1Desc: "Please provide personal details of the family head.",
            fullName: "Full Name",
            fatherName: "Father's Name",
            gender: "Gender",
            dob: "Date of Birth",
            maritalStatus: "Marital Status",
            bloodGroup: "Blood Group",
            mobile: "Mobile Number",
            whatsapp: "WhatsApp Number",
            email: "Email Address",
            navHead: "Head Details",
            navAddr: "Address",
            navMem: "Members",
            navNom: "Nominee",
            navDec: "Submission",
            step4Title: "Nominee & Emergency Details",
            step4Desc: "Select your nominee and provide emergency contact information.",
            nomineeSelectType: "Nominee Selection",
            fromFamily: "From Added Family Members",
            fromOther: "Other (Not in family)",
            selectMember: "Select Family Member",
            emergencyContact: "Emergency Contact",
            emergencyName: "Emergency Name",
            emergencyMobile: "Emergency Mobile",
            next: "Next",
            prev: "Previous",
            declarationTitle: "Declarations & Submit",
            headDecTitle: "Declaration by Family Head",
            headDecText: "\"I hereby declare that all the information provided by me is true and correct to the best of my knowledge. I understand that Jagdamba Samiti is a voluntary mutual support group and not a government body or insurance scheme. I agree that any false information may lead to suspension or removal of my family’s membership.\"",
            agreeDec: "I Agree to the Declaration",
            termsTitle: "Terms & Conditions",
            term1: "1. Jagdamba Samiti is a self-help voluntary group (NOT an Insurance Company).",
            term2: "2. This membership does not guarantee financial aid; it depends on committee approval.",
            term3: "3. All benefits are subject to active membership and regular contributions.",
            term4: "4. Any misuse of funds or misinformation leads to permanent removal.",
            term5: "5. Personal data is kept confidential and used for Samiti purposes only.",
            acceptTerms: "I Accept all Terms & Conditions",
            submitBtn: "Submit Final Application",
            submitting: "Submitting Application...",
            addrTitle: "Address Details",
            houseNo: "House No / Street",
            locality: "Locality / Colony",
            village: "Village / Town / City",
            postOffice: "Post Office",
            policeStation: "Police Station",
            block: "Block / Tehsil",
            district: "District",
            state: "State",
            pinCode: "PIN Code",
            sameAddress: "Permanent address same as Current",
            country: "Country",
            otherCountry: "Other Country",
            famStruct: "Family Structure",
            occDetails: "Occupation Details",
            step3Title: "Family Member Add",
            step3Desc: "Add all your family members including spouse and children.",
            addNewMem: "Add New Member",
            relation: "Relation with Head",
            fatherHusband: "Father/Husband Name",
            education: "Education Level",
            class: "Class / Standard",
            occupation: "Occupation",
            seriousIllness: "Serious Illness",
            diffAbled: "Differently Abled",
            addMemberBtn: "Add This Member",
            noMembers: "No members added yet.",
            familyList: "Family List",
            membersCount: "member(s)",
            titlePlaceholder: "Title",
            searchCountry: "Search Country...",
            isEarning: "Earning or Not?",
            earning: "Earning",
            notEarning: "Not Earning",
            residenceType: "Residence Status",
            residencePurpose: "Purpose of Separate Stay",
            withFamily: "Staying with Family",
            separate: "Staying Separate",
            rPurposeStudying: "Studying",
            rPurposeEarning: "Job / Earning",
            rPurposeOther: "Other",
            residenceAddress: "Current Address",
            workAddress: "Work Address",
            seriousIllnessDetails: "Details of Illness",
            diffAbledDetails: "Details of Disability",
            nomineeList: "Nominee List",
            nomineeName: "Nominee Full Name",
            sharePerc: "Share Percentage (%)",
            nomineeMobile: "Nominee Mobile Number",
            designation: "Designation / Position",
            organization: "Organization / Company"
        },
        hi: {
            title: "अपना प्रोफाइल पूरा करें",
            aboutTitle: "जगदंबा समिति के बारे में",
            aboutText1: "जगदंबा समिति संकट के समय परिवारों की सहायता के लिए गठित एक स्वैच्छिक, गैर-लाभकारी आपसी सहयोग संस्था है।",
            aboutText2: "हम कोई बीमा प्रदाता नहीं हैं। यह एक सामुदायिक कोष है जो सदस्यों द्वारा सदस्यों के लिए प्रबंधित किया जाता है।",
            aboutText3: "सदस्यता के लिए विवरणों के सत्यापन और समिति की स्वीकृति की आवश्यकता होती है।",
            iUnderstand: "मैंने उद्देश्यों को पढ़ और समझ लिया है।",
            proceedBtn: "पंजीकरण के लिए आगे बढ़ें",
            step1: "मुखिया का विवरण",
            step1Desc: "कृपया परिवार के मुखिया का व्यक्तिगत विवरण प्रदान करें।",
            fullName: "पूरा नाम",
            fatherName: "पिता का नाम",
            gender: "लिंग",
            dob: "जन्म तिथि",
            maritalStatus: "वैवाहिक स्थिति",
            bloodGroup: "रक्त समूह",
            mobile: "मोबाइल नंबर",
            whatsapp: "व्हाट्सएप नंबर",
            email: "ईमेल पता",
            navHead: "मुखिया विवरण",
            navAddr: "पता",
            navMem: "सदस्य",
            navNom: "नामित व्यक्ति",
            navDec: "जमा करें",
            step4Title: "नामित और आपातकालीन विवरण",
            step4Desc: "अपने नामित व्यक्ति का चयन करें और आपातकालीन संपर्क जानकारी प्रदान करें।",
            nomineeSelectType: "नामित व्यक्ति का चयन",
            fromFamily: "परिवार के सदस्यों में से",
            fromOther: "अन्य (बाहरी व्यक्ति)",
            selectMember: "सदस्य चुनें",
            emergencyContact: "आपातकालीन संपर्क",
            emergencyName: "संपर्क नाम",
            emergencyMobile: "संपर्क मोबाइल",
            next: "अगला",
            prev: "पिछला",
            declarationTitle: "घोषणा और जमा करें",
            headDecTitle: "मुखिया द्वारा घोषणा",
            headDecText: "\"मैं घोषित करता हूँ कि दी गई जानकारी सत्य है। गलत जानकारी पर सदस्यता रद्द की जा सकती है।\"",
            agreeDec: "मैं सहमत हूँ",
            termsTitle: "नियम और शर्तें",
            term1: "1. जगदंबा समिति स्व-सहायता समूह है।",
            term2: "2. सदस्यता वित्तीय सहायता की गारंटी नहीं है।",
            term3: "3. लाभ नियमित योगदान पर निर्भर हैं।",
            term4: "4. गलत जानकारी पर निष्कासन संभव है।",
            term5: "5. डेटा गोपनीय रखा जाता है।",
            acceptTerms: "मैं नियमों से सहमत हूँ",
            submitBtn: "आवेदन जमा करें",
            submitting: "जमा हो रहा है...",
            addrTitle: "पता विवरण",
            houseNo: "मकान नंबर / गली",
            locality: "मोहल्ला / कॉलोनी",
            village: "गाँव / शहर",
            postOffice: "डाकघर",
            policeStation: "पुलिस थाना",
            block: "ब्लॉक / तहसील",
            district: "जिला",
            state: "राज्य",
            pinCode: "पिन कोड",
            sameAddress: "स्थायी और वर्तमान पता एक ही है",
            country: "देश",
            otherCountry: "अन्य देश",
            famStruct: "परिवार संरचना",
            occDetails: "व्यवसाय विवरण",
            step3Title: "सदस्य जोड़ें",
            step3Desc: "परिवार के सभी सदस्यों को जोड़ें।",
            addNewMem: "नया सदस्य जोड़ें",
            relation: "मुखिया से संबंध",
            fatherHusband: "पिता/पति का नाम",
            education: "शिक्षा स्तर",
            class: "कक्षा / स्तर",
            occupation: "व्यवसाय",
            seriousIllness: "गंभीर बीमारी",
            diffAbled: "दिव्यांग",
            addMemberBtn: "सदस्य जोड़ें",
            noMembers: "कोई सदस्य नहीं जोड़ा गया",
            familyList: "परिवार सूची",
            membersCount: "सदस्य",
            titlePlaceholder: "शीर्षक",
            searchCountry: "देश खोजें...",
            isEarning: "कमाई कर रहे हैं?",
            earning: "हाँ",
            notEarning: "नहीं",
            residenceType: "निवास की स्थिति",
            residencePurpose: "अलग रहने का कारण",
            withFamily: "परिवार के साथ",
            separate: "अलग रहते हैं",
            rPurposeStudying: "पढ़ाई",
            rPurposeEarning: "नौकरी / कमाई",
            rPurposeOther: "अन्य",
            residenceAddress: "वर्तमान पता",
            workAddress: "काम का पता",
            seriousIllnessDetails: "बीमारी का विवरण",
            diffAbledDetails: "दिव्यांगता का विवरण",
            nomineeList: "नामित सूची",
            nomineeName: "नामित व्यक्ति का पूरा नाम",
            sharePerc: "हिस्सेदारी प्रतिशत (%)",
            nomineeMobile: "नामित व्यक्ति का मोबाइल नंबर",
            designation: "पद / पदनाम",
            organization: "संस्था / कंपनी"
        }
    };

    const t = translations[language];

    const [formData, setFormData] = useState({
        head_details: {
            full_name: '', full_name_title: 'Shri', father_name: '', father_name_title: 'Shri', gender: 'Male', dob: '',
            marital_status: 'Married', blood_group: '',
            mobile: '', whatsapp: '', email: '',
            total_members: 1, lives_together: 'Yes', family_type: 'Nuclear', family_type_other: '',
            occupation: 'Private Job', occupation_other: '', designation: '', organization: '', sector: 'Private Sector',
            education_level: 'Graduate', education_level_other: '',
            education_class: '',
            education_class_other: '',
            is_earning: 'Yes',
            residence_type: 'With Family',
            residence_purpose: ''
        },
        nominee_details: {
            nominees: [],
            emergency_name: '',
            emergency_mobile: ''
        },
        current_address: {
            country: 'India', house_no: '', locality: '', village_town_city: '', post_office: '', police_station: '',
            block_tehsil: '', district: '', state: 'Bihar', pin_code: '', landmark: ''
        },
        same_as_permanent: false,
        permanent_address: {
            country: 'India', house_no: '', locality: '', village_town_city: '', post_office: '', police_station: '',
            block_tehsil: '', district: '', state: 'Bihar', pin_code: '', landmark: ''
        },
        members: [],
        declarations: {
            head_declared: false,
            member_declared: false,
            terms_accepted: false
        }
    });

    useEffect(() => {
        const currentUser = JSON.parse(localStorage.getItem('user'));

        const loadExistingData = async () => {
            try {
                const res = await api.getMyFamily();
                if (res.data) {
                    const d = res.data;
                    setFormData(prev => ({
                        ...prev,
                        ...d,
                        head_details: {
                            ...prev.head_details,
                            ...d.head_details,
                            full_name: d.head_details?.full_name || d.head_name || currentUser?.name || '',
                            mobile: d.head_details?.mobile || currentUser?.phone || '',
                            email: d.head_details?.email || currentUser?.email || '',
                            father_name: d.head_details?.father_name || prev.head_details.father_name
                        },
                        current_address: d.current_address || prev.current_address,
                        permanent_address: d.permanent_address || prev.permanent_address,
                        nominee_details: d.nominee_details || prev.nominee_details,
                        same_as_permanent: d.same_as_permanent ?? prev.same_as_permanent
                    }));
                }
            } catch (err) {
                console.error("Failed to load existing family data:", err);
            }
        };

        if (isEmbedded) {
            loadExistingData();
        } else if (currentUser) {
            setFormData(prev => ({
                ...prev,
                head_details: { ...prev.head_details, full_name: currentUser.name || '', mobile: currentUser.phone || '', email: currentUser.email || '' }
            }));
        }
    }, [isEmbedded]);

    const [memberTemp, setMemberTemp] = useState({
        full_name: '', full_name_title: 'Shri', father_husband_name: '', father_husband_title: 'Shri', relation: '', gender: 'Male', dob: '',
        marital_status: 'Single', blood_group: '', mobile: '',
        education_level: 'High School', occupation_type: 'Student', occupation: 'Student', designation: '', organization: '', occupation_sector: '',
        relation_other: '', education_level_other: '', occupation_type_other: '',
        education_class: '', education_class_other: '', school_type: '', education_stream: '', profession_details: '', is_earning: 'No',
        residence_type: 'With Family', residence_purpose: '',
        residence_address: { country: 'India', house_no: '', locality: '', village_town_city: '', post_office: '', police_station: '', block_tehsil: '', district: '', state: 'Bihar', pin_code: '', landmark: '' },
        work_address: { country: 'India', house_no: '', locality: '', village_town_city: '', post_office: '', police_station: '', block_tehsil: '', district: '', state: 'Bihar', pin_code: '', landmark: '' },
        has_serious_illness: false, serious_illness_details: '',
        is_specially_abled: false, specially_abled_details: ''
    });

    const [nomineeTemp, setNomineeTemp] = useState({
        is_family_member: true,
        selected_member_id: '',
        full_name: '',
        relation: '',
        relation_other: '',
        mobile: '',
        dob: '',
        share_percentage: ''
    });

    const handleChange = (section, field, value) => {
        setFormData(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
    };

    const handlePinChange = async (section, pinValue) => {
        handleChange(section, 'pin_code', pinValue);

        if (pinValue.length === 6 && formData[section].country === 'India') {
            setIsPinLoading(true);
            try {
                const response = await fetch(`https://api.postalpincode.in/pincode/${pinValue}`);
                const data = await response.json();

                if (data && data[0] && data[0].Status === 'Success') {
                    const info = data[0].PostOffice[0];
                    setFormData(prev => ({
                        ...prev,
                        [section]: {
                            ...prev[section],
                            district: info.District,
                            state: info.State,
                            village_town_city: info.Block !== 'NA' ? info.Block : prev[section].village_town_city
                        }
                    }));
                }
            } catch (error) {
                console.error("PIN Lookup Error:", error);
            } finally {
                setIsPinLoading(false);
            }
        }
    };

    const handleMemberChange = (field, value) => {
        setMemberTemp(prev => ({ ...prev, [field]: value }));
    };

    const handleNomineeChange = (field, value) => {
        setNomineeTemp(prev => ({ ...prev, [field]: value }));
    };

    const addNominee = () => {
        if (!nomineeTemp.full_name || !nomineeTemp.relation || !nomineeTemp.share_percentage) {
            return alert("Name, Relationship and Share % are required.");
        }

        const totalShare = formData.nominee_details.nominees.reduce((sum, n) => sum + Number(n.share_percentage), 0);
        if (totalShare + Number(nomineeTemp.share_percentage) > 100) {
            return alert("Total share percentage cannot exceed 100%.");
        }

        setFormData(prev => ({
            ...prev,
            nominee_details: {
                ...prev.nominee_details,
                nominees: [...prev.nominee_details.nominees, { ...nomineeTemp }]
            }
        }));

        setNomineeTemp({
            is_family_member: true,
            selected_member_id: '',
            full_name: '',
            relation: '',
            relation_other: '',
            mobile: '',
            dob: '',
            share_percentage: ''
        });
    };

    const removeNominee = (index) => {
        setFormData(prev => ({
            ...prev,
            nominee_details: {
                ...prev.nominee_details,
                nominees: prev.nominee_details.nominees.filter((_, i) => i !== index)
            }
        }));
    };

    const addMember = () => {
        if (!memberTemp.full_name || !memberTemp.relation) return alert("Name and Relationship are required.");
        setFormData(prev => ({ ...prev, members: [...prev.members, { ...memberTemp }] }));
        setMemberTemp({
            full_name: '', full_name_title: 'Shri', father_husband_name: '', father_husband_title: 'Shri', relation: '', gender: 'Male', dob: '',
            marital_status: 'Single', blood_group: '', mobile: '',
            education_level: 'High School', occupation_type: 'Student', occupation: 'Student', designation: '', organization: '', occupation_sector: '',
            relation_other: '', education_level_other: '', occupation_type_other: '',
            education_class: '', education_class_other: '', school_type: '', education_stream: '', profession_details: '', is_earning: 'No',
            residence_type: 'With Family', residence_purpose: '',
            residence_address: { country: 'India', house_no: '', locality: '', village_town_city: '', post_office: '', police_station: '', block_tehsil: '', district: '', state: 'Bihar', pin_code: '', landmark: '' },
            work_address: { country: 'India', house_no: '', locality: '', village_town_city: '', post_office: '', police_station: '', block_tehsil: '', district: '', state: 'Bihar', pin_code: '', landmark: '' },
            has_serious_illness: false, serious_illness_details: '',
            is_specially_abled: false, specially_abled_details: ''
        });
    };

    const handleMemberAddressPinChange = async (addressType, pinValue) => {
        handleMemberChange(addressType, { ...memberTemp[addressType], pin_code: pinValue });

        if (pinValue.length === 6) {
            setIsPinLoading(true);
            try {
                const response = await fetch(`https://api.postalpincode.in/pincode/${pinValue}`);
                const data = await response.json();

                if (data && data[0] && data[0].Status === 'Success') {
                    const info = data[0].PostOffice[0];
                    handleMemberChange(addressType, {
                        ...memberTemp[addressType],
                        pin_code: pinValue,
                        district: info.District,
                        state: info.State,
                        village_town_city: info.Block !== 'NA' ? info.Block : memberTemp[addressType].village_town_city
                    });
                }
            } catch (error) {
                console.error("PIN Lookup Error:", error);
            } finally {
                setIsPinLoading(false);
            }
        }
    };

    const handleSubmit = async () => {
        const totalShare = formData.nominee_details.nominees.reduce((sum, n) => sum + Number(n.share_percentage), 0);
        if (formData.nominee_details.nominees.length > 0 && totalShare !== 100) {
            return alert("Total nominee share percentage must equal exactly 100%.");
        }

        if (!formData.declarations.head_declared || !formData.declarations.terms_accepted) {
            return alert("You must accept the Family Declaration and Terms & Conditions.");
        }
        setIsSubmitting(true);
        try {
            if (isEmbedded) {
                await api.completeProfile(formData);
                alert("Profile submitted successfully for verification!");
                if (onSuccess) onSuccess();
            } else {
                const res = await fetch('/api/families/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                if (res.ok) {
                    alert("Registration Successful!");
                    window.location.href = '/login';
                } else {
                    const errorData = await res.json().catch(() => ({}));
                    alert(`Registration Failed: ${errorData.detail || "Please check all fields."}`);
                }
            }
        } catch (err) {
            console.error("System error during registration:", err);

            if (err.response?.status === 401) {
                alert("Session expired or invalid credential. System will log you out.");
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return;
            }

            const errorMessage = err.response?.data?.detail
                ? (typeof err.response.data.detail === 'object' ? JSON.stringify(err.response.data.detail) : err.response.data.detail)
                : err.message || "System Error. Please try again later.";
            alert(`Submission Error: ${errorMessage}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const sectionTitleStyle = { fontSize: '1.5rem', color: '#1f2937', marginBottom: '25px', borderBottom: '2px solid #f3f4f6', paddingBottom: '10px' };

    if (formData.status === 'Approved') {
        return (
            <>
                <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800&family=Inter:wght@400;500;600;700&family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap" rel="stylesheet" />
                {!isEmbedded && <Header />}
                <div className="container" style={{ maxWidth: '800px', margin: '40px auto' }}>
                    <div className="form-card animate-on-scroll" style={{ textAlign: 'center', padding: '60px 40px' }}>
                        <div style={{ fontSize: '5rem', marginBottom: '20px', filter: 'drop-shadow(0 10px 20px rgba(22, 101, 52, 0.2))' }}>✅</div>
                        <h2 style={{ color: '#166534', marginBottom: '15px', fontSize: '2.5rem', fontWeight: 800 }}>Family Profile Approved</h2>
                        <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '30px' }}>Congratulations! Your family is now a registered member of Jagdamba Samiti.</p>

                        <div style={{
                            fontSize: '1.8rem',
                            fontWeight: '800',
                            margin: '0 auto 40px',
                            padding: '25px',
                            background: 'linear-gradient(135deg, #dcfce7 0%, #f0fdf4 100%)',
                            color: '#15803d',
                            borderRadius: '16px',
                            border: '2px dashed #86efac',
                            maxWidth: '400px',
                            boxShadow: '0 10px 30px -10px rgba(22, 163, 74, 0.2)'
                        }}>
                            <div style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '2px', color: '#166534', marginBottom: '5px' }}>Family ID</div>
                            {formData.family_unique_id}
                        </div>

                        <div style={{ textAlign: 'left', background: '#f8fafc', padding: '30px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                            <h3 style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '15px', marginBottom: '20px', color: '#334155' }}>Head Details</h3>
                            <div className="grid-2">
                                <div><strong style={{ color: '#64748b' }}>Name:</strong> <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e293b' }}>{formData.head_details.full_name}</div></div>
                                <div><strong style={{ color: '#64748b' }}>Phone:</strong> <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e293b' }}>{formData.head_details.mobile}</div></div>
                                <div><strong style={{ color: '#64748b' }}>Members:</strong> <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e293b' }}>{formData.members?.length || 0}</div></div>
                                <div><strong style={{ color: '#64748b' }}>District:</strong> <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e293b' }}>{formData.current_address?.district || 'N/A'}</div></div>
                            </div>
                        </div>

                        <div style={{ marginTop: '40px', display: 'flex', gap: '15px', justifyContent: 'center' }}>
                            <button onClick={() => window.location.href = '/dashboard'} className="cta-button" style={{ minWidth: '200px' }}>
                                Go to Dashboard
                            </button>
                            <button className="cta-button" style={{ background: 'white', color: 'var(--primary)', border: '2px solid var(--primary)', minWidth: '200px' }}>
                                Download ID Card
                            </button>
                        </div>
                    </div>
                </div>
                {!isEmbedded && <Footer />}
            </>
        )
    }

    return (
        <>
            <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800&family=Inter:wght@400;500;600;700&family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap" rel="stylesheet" />
            {!isEmbedded && <Header />}
            <div className="container" style={{ maxWidth: isEmbedded ? '100%' : '1200px', width: isEmbedded ? '100%' : '90%', margin: isEmbedded ? '0 0 30px 0' : '40px auto', padding: isEmbedded ? '0' : '0 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>{t.title}</h2>
                    <button
                        onClick={() => setLanguage(lang => lang === 'en' ? 'hi' : 'en')}
                        style={{ padding: '10px 20px', borderRadius: '30px', border: '2px solid var(--primary)', background: '#fff', color: 'var(--primary)', cursor: 'pointer', fontWeight: 700, transition: '0.3s' }}
                        onMouseOver={e => { e.target.style.background = 'var(--primary)'; e.target.style.color = '#fff'; }}
                        onMouseOut={e => { e.target.style.background = '#fff'; e.target.style.color = 'var(--primary)'; }}
                    >
                        {language === 'en' ? 'हिन्दी में बदलें' : 'Switch to English'}
                    </button>
                </div>

                {step === 0 && (
                    <div className="form-card" style={{ textAlign: 'center', padding: '60px 40px' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🏛️</div>
                        <h3 style={{ color: 'var(--primary)', marginBottom: '25px', fontSize: '2rem', fontWeight: 800 }}>{t.aboutTitle}</h3>
                        <div style={{ maxWidth: '700px', margin: '0 auto', color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: '1.8' }}>
                            <p style={{ marginBottom: '20px' }}>{t.aboutText1}</p>
                            <p>{t.aboutText2}</p>
                        </div>
                        <button onClick={() => setStep(1)} className="cta-button" style={{ background: 'var(--primary)', color: 'white', margin: '40px auto 0', padding: '16px 48px', fontSize: '1.1rem' }}>
                            {t.proceedBtn} <span style={{ fontSize: '1.3rem' }}>↗</span>
                        </button>
                    </div>
                )}

                {step > 0 && (
                    <div className="fade-in">
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '40px', overflowX: 'auto', paddingBottom: '10px' }}>
                            {[t.navHead, t.navAddr, t.navDec].map((label, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => setStep(idx + 1)}
                                    className={`nav-step ${step === idx + 1 ? 'active' : 'inactive'}`}
                                >
                                    {label}
                                </div>
                            ))}
                        </div>

                        <div className="form-card">
                            {step === 1 && (
                                <div className="fade-in">
                                    <h3 className="section-title"><span>🟡</span> {t.step1}</h3>
                                    <p style={{ color: 'var(--text-muted)', marginBottom: '30px', fontSize: '1rem' }}>{t.step1Desc}</p>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', alignItems: 'end' }}>
                                        <div className="input-group">
                                            <label>{t.fullName} *</label>
                                            <input
                                                className="form-input"
                                                placeholder="e.g. Shri Rajesh Kumar"
                                                value={formData.head_details.full_name}
                                                onChange={e => handleChange('head_details', 'full_name', e.target.value)}
                                            />
                                        </div>

                                        <div className="input-group">
                                            <label>{t.fatherName} *</label>
                                            <input
                                                className="form-input"
                                                placeholder="e.g. Shri Rameshwar Kumar"
                                                value={formData.head_details.father_name}
                                                onChange={e => handleChange('head_details', 'father_name', e.target.value)}
                                            />
                                        </div>

                                        <div className="input-group">
                                            <label>{t.gender} *</label>
                                            <select
                                                className="form-input"
                                                value={formData.head_details.gender}
                                                onChange={e => handleChange('head_details', 'gender', e.target.value)}
                                            >
                                                {(formOptions.gender || []).map(opt => (
                                                    <option key={opt.value} value={opt.value}>{opt[language]}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="input-group">
                                            <label>{t.dob} *</label>
                                            <DateInput
                                                className="form-input"
                                                value={formData.head_details.dob}
                                                onChange={e => handleChange('head_details', 'dob', e.target.value)}
                                            />
                                        </div>

                                        <div className="input-group">
                                            <label>{t.maritalStatus} *</label>
                                            <select
                                                className="form-input"
                                                value={formData.head_details.marital_status}
                                                onChange={e => handleChange('head_details', 'marital_status', e.target.value)}
                                            >
                                                {(formOptions.marital_status || []).map(opt => (
                                                    <option key={opt.value} value={opt.value}>{opt[language]}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="input-group">
                                            <label>{t.bloodGroup}</label>
                                            <select
                                                className="form-input"
                                                value={formData.head_details.blood_group}
                                                onChange={e => handleChange('head_details', 'blood_group', e.target.value)}
                                            >
                                                <option value="">{language === 'hi' ? 'चुनें' : 'Select'}</option>
                                                {(formOptions.blood_group || []).map(opt => (
                                                    <option key={opt.value} value={opt.value}>{opt[language]}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="input-group">
                                            <label>{t.mobile} *</label>
                                            <input className="form-input" placeholder="10 Digit Number" value={formData.head_details.mobile} onChange={e => handleChange('head_details', 'mobile', e.target.value)} />
                                        </div>

                                        <div className="input-group">
                                            <label>{t.whatsapp}</label>
                                            <input className="form-input" placeholder="WhatsApp Number" value={formData.head_details.whatsapp} onChange={e => handleChange('head_details', 'whatsapp', e.target.value)} />
                                        </div>

                                        <div className="input-group">
                                            <label>{t.email}</label>
                                            <input className="form-input" type="email" placeholder="example@mail.com" value={formData.head_details.email} onChange={e => handleChange('head_details', 'email', e.target.value)} />
                                        </div>
                                    </div>

                                    <h4 className="sub-section-title">👨‍👩‍👦 {t.famStruct}</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', alignItems: 'end' }}>
                                        <div className="input-group">
                                            <label>Family Type</label>
                                            <select
                                                className="form-input"
                                                value={formData.head_details.family_type}
                                                onChange={e => handleChange('head_details', 'family_type', e.target.value)}
                                            >
                                                {(formOptions.family_type || []).map(opt => (
                                                    <option key={opt.value} value={opt.value}>{opt[language]}</option>
                                                ))}
                                            </select>
                                            {formData.head_details.family_type === 'Other' && (
                                                <input
                                                    className="form-input"
                                                    placeholder="Please specify family type"
                                                    style={{ marginTop: '10px' }}
                                                    value={formData.head_details.family_type_other}
                                                    onChange={e => handleChange('head_details', 'family_type_other', e.target.value)}
                                                />
                                            )}
                                        </div>
                                        <div className="input-group">
                                            <label>Total Members in Family</label>
                                            <input className="form-input" type="number" value={formData.head_details.total_members} onChange={e => handleChange('head_details', 'total_members', e.target.value)} />
                                        </div>
                                    </div>

                                    <h4 className="sub-section-title">💼 {t.occDetails}</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', alignItems: 'end' }}>
                                        <div className="input-group">
                                            <label>{t.education}</label>
                                            <select
                                                className="form-input"
                                                value={formData.head_details.education_level}
                                                onChange={e => handleChange('head_details', 'education_level', e.target.value)}
                                            >
                                                {(formOptions.education_level || []).map(opt => (
                                                    <option key={opt.value} value={opt.value}>{opt[language]}</option>
                                                ))}
                                            </select>
                                            {formData.head_details.education_level === 'Other' && (
                                                <input
                                                    className="form-input"
                                                    placeholder="Specify education level"
                                                    style={{ marginTop: '10px' }}
                                                    value={formData.head_details.education_level_other}
                                                    onChange={e => handleChange('head_details', 'education_level_other', e.target.value)}
                                                />
                                            )}
                                        </div>

                                        {(formData.head_details.education_level !== 'Studying' && formData.head_details.education_level !== 'Literate' && formData.head_details.education_level !== 'Illiterate') ? (
                                            <>
                                                <div className="input-group">
                                                    <label>{t.occupation}</label>
                                                    <select
                                                        className="form-input"
                                                        value={formData.head_details.occupation}
                                                        onChange={e => handleChange('head_details', 'occupation', e.target.value)}
                                                    >
                                                        {(formOptions.occupation || []).map(opt => (
                                                            <option key={opt.value} value={opt.value}>{opt[language]}</option>
                                                        ))}
                                                    </select>
                                                    {formData.head_details.occupation === 'Other' && (
                                                        <input
                                                            className="form-input"
                                                            placeholder="Specify occupation"
                                                            style={{ marginTop: '10px' }}
                                                            value={formData.head_details.occupation_other}
                                                            onChange={e => handleChange('head_details', 'occupation_other', e.target.value)}
                                                        />
                                                    )}
                                                </div>
                                                {formData.head_details.occupation !== 'Unemployed' && (
                                                    <>
                                                        <div className="input-group">
                                                            <label>{t.designation}</label>
                                                            <input
                                                                className="form-input"
                                                                placeholder="e.g. Manager / Engineer"
                                                                value={formData.head_details.designation}
                                                                onChange={e => handleChange('head_details', 'designation', e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="input-group">
                                                            <label>{t.organization}</label>
                                                            <input
                                                                className="form-input"
                                                                placeholder="e.g. Google / Reliance / Self-Owned"
                                                                value={formData.head_details.organization}
                                                                onChange={e => handleChange('head_details', 'organization', e.target.value)}
                                                            />
                                                        </div>
                                                    </>
                                                )}
                                            </>
                                        ) : formData.head_details.education_level === 'Studying' ? (
                                            <div className="input-group">
                                                <label style={{ fontSize: '0.85rem', marginBottom: '5px', display: 'block' }}>{t.class}</label>
                                                <select
                                                    className="form-input"
                                                    value={formData.head_details.education_class}
                                                    onChange={e => handleChange('head_details', 'education_class', e.target.value)}
                                                >
                                                    <option value="">Select Class</option>
                                                    {(formOptions.education_class || []).map(opt => (
                                                        <option key={opt.value} value={opt.value}>{opt[language]}</option>
                                                    ))}
                                                </select>
                                                {formData.head_details.education_class === 'Other' && (
                                                    <input
                                                        className="form-input"
                                                        placeholder="Specify class"
                                                        style={{ marginTop: '10px' }}
                                                        value={formData.head_details.education_class_other}
                                                        onChange={e => handleChange('head_details', 'education_class_other', e.target.value)}
                                                    />
                                                )}
                                            </div>
                                        ) : <div />}


                                        <div className="input-group">
                                            <label>{t.residenceType}</label>
                                            <select
                                                className="form-input"
                                                value={formData.head_details.residence_type}
                                                onChange={e => handleChange('head_details', 'residence_type', e.target.value)}
                                            >
                                                <option value="With Family">{t.withFamily}</option>
                                                <option value="Separate">{t.separate}</option>
                                            </select>
                                        </div>
                                        {formData.head_details.residence_type === 'Separate' && (
                                            <>
                                                <div className="input-group">
                                                    <label>{t.residencePurpose}</label>
                                                    <select
                                                        className="form-input"
                                                        value={formData.head_details.residence_purpose}
                                                        onChange={e => handleChange('head_details', 'residence_purpose', e.target.value)}
                                                    >
                                                        <option value="">Select Purpose</option>
                                                        <option value="Studying">{t.rPurposeStudying}</option>
                                                        <option value="Job">{t.rPurposeEarning}</option>
                                                        <option value="Other">{t.rPurposeOther}</option>
                                                    </select>
                                                </div>

                                                <div className="input-group" style={{ gridColumn: '1 / -1', marginTop: '10px', marginBottom: '10px' }}>
                                                    <h5 style={{ margin: 0, color: 'var(--primary)', fontSize: '1rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '5px' }}>📍 Current Address Details</h5>
                                                </div>

                                                <div className="input-group">
                                                    <label>Country *</label>
                                                    <SearchableSelect
                                                        value={formData.current_address.country}
                                                        onChange={val => handleChange('current_address', 'country', val)}
                                                        options={COUNTRIES}
                                                        placeholder="Select Country"
                                                    />
                                                </div>

                                                {formData.current_address.country === 'India' && (
                                                    <div className="input-group">
                                                        <label>{t.pinCode} * {isPinLoading && <span style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>...</span>}</label>
                                                        <input
                                                            className="form-input"
                                                            placeholder="6-digit PIN"
                                                            value={formData.current_address.pin_code}
                                                            onChange={e => handlePinChange('current_address', e.target.value)}
                                                        />
                                                    </div>
                                                )}

                                                <div className="input-group">
                                                    <label>{t.houseNo} *</label>
                                                    <input className="form-input" value={formData.current_address.house_no} onChange={e => handleChange('current_address', 'house_no', e.target.value)} />
                                                </div>
                                                <div className="input-group">
                                                    <label>{t.locality} *</label>
                                                    <input className="form-input" value={formData.current_address.locality} onChange={e => handleChange('current_address', 'locality', e.target.value)} />
                                                </div>
                                                <div className="input-group">
                                                    <label>{formData.current_address.country === 'India' ? t.village : 'City / Town'} *</label>
                                                    <input className="form-input" value={formData.current_address.village_town_city} onChange={e => handleChange('current_address', 'village_town_city', e.target.value)} />
                                                </div>
                                                <div className="input-group">
                                                    <label>{formData.current_address.country === 'India' ? t.district : 'District'} *</label>
                                                    <input className="form-input" value={formData.current_address.district} onChange={e => handleChange('current_address', 'district', e.target.value)} />
                                                </div>
                                                <div className="input-group">
                                                    <label>{formData.current_address.country === 'India' ? t.state : 'State'} *</label>
                                                    <input className="form-input" value={formData.current_address.state} onChange={e => handleChange('current_address', 'state', e.target.value)} />
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'flex-end' }}>
                                        <button onClick={() => setStep(2)} className="cta-button" style={{ background: 'var(--primary)', color: 'white' }}>
                                            {t.next} <span style={{ fontSize: '1.2rem' }}>→</span>
                                        </button>
                                    </div>
                                </div>
                            )}


                            {step === 2 && (
                                <div className="fade-in">
                                    <h3 className="section-title"><span>🏠</span> {t.addrTitle}</h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', alignItems: 'end' }}>
                                        <div className="input-group">
                                            <label>Country *</label>
                                            <SearchableSelect
                                                value={formData.current_address.country}
                                                onChange={val => handleChange('current_address', 'country', val)}
                                                options={COUNTRIES}
                                                placeholder="Select Country"
                                            />
                                        </div>

                                        {formData.current_address.country === 'India' && (
                                            <div className="input-group">
                                                <label>{t.pinCode} * {isPinLoading && <span style={{ fontSize: '0.8rem', color: 'var(--primary)' }}> (Fetching details...)</span>}</label>
                                                <input
                                                    className="form-input"
                                                    placeholder="6-digit PIN"
                                                    value={formData.current_address.pin_code}
                                                    onChange={e => handlePinChange('current_address', e.target.value)}
                                                />
                                            </div>
                                        )}

                                        <div className="input-group">
                                            <label>{t.houseNo} *</label>
                                            <input className="form-input" value={formData.current_address.house_no} onChange={e => handleChange('current_address', 'house_no', e.target.value)} />
                                        </div>
                                        <div className="input-group">
                                            <label>{t.locality} *</label>
                                            <input className="form-input" value={formData.current_address.locality} onChange={e => handleChange('current_address', 'locality', e.target.value)} />
                                        </div>
                                        <div className="input-group">
                                            <label>{formData.current_address.country === 'India' ? t.village : 'City / Town'} *</label>
                                            <input className="form-input" value={formData.current_address.village_town_city} onChange={e => handleChange('current_address', 'village_town_city', e.target.value)} />
                                        </div>

                                        {formData.current_address.country === 'India' && (
                                            <>
                                                <div className="input-group">
                                                    <label>{t.block}</label>
                                                    <input className="form-input" value={formData.current_address.block_tehsil} onChange={e => handleChange('current_address', 'block_tehsil', e.target.value)} />
                                                </div>
                                                <div className="input-group">
                                                    <label>{t.postOffice}</label>
                                                    <input className="form-input" value={formData.current_address.post_office} onChange={e => handleChange('current_address', 'post_office', e.target.value)} />
                                                </div>
                                                <div className="input-group">
                                                    <label>{t.policeStation}</label>
                                                    <input className="form-input" value={formData.current_address.police_station} onChange={e => handleChange('current_address', 'police_station', e.target.value)} />
                                                </div>
                                            </>
                                        )}

                                        <div className="input-group">
                                            <label>{formData.current_address.country === 'India' ? t.district : 'District / Region'} *</label>
                                            <input className="form-input" value={formData.current_address.district} onChange={e => handleChange('current_address', 'district', e.target.value)} />
                                        </div>
                                        <div className="input-group">
                                            <label>{formData.current_address.country === 'India' ? t.state : 'State / Province'} *</label>
                                            <input className="form-input" value={formData.current_address.state} onChange={e => handleChange('current_address', 'state', e.target.value)} />
                                        </div>
                                    </div>

                                    <div style={{ marginTop: '30px', padding: '20px', background: 'var(--bg-light)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontWeight: '700', color: 'var(--text-main)' }}>
                                            <input
                                                style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                                                type="checkbox"
                                                checked={formData.same_as_permanent}
                                                onChange={e => {
                                                    const checked = e.target.checked;
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        same_as_permanent: checked,
                                                        permanent_address: checked ? { ...prev.current_address } : { ...prev.permanent_address }
                                                    }));
                                                }}
                                            />
                                            {t.sameAddress}
                                        </label>
                                    </div>

                                    {!formData.same_as_permanent && (
                                        <div className="fade-in" style={{ marginTop: '40px' }}>
                                            <h4 className="sub-section-title">📍 Permanent Address</h4>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', alignItems: 'end' }}>
                                                <div className="input-group">
                                                    <label>Country *</label>
                                                    <input
                                                        className="form-input"
                                                        value="India"
                                                        readOnly
                                                        style={{ background: '#f8fafc', cursor: 'not-allowed', color: 'var(--text-muted)' }}
                                                    />
                                                </div>
                                                <div className="input-group">
                                                    <label>{t.pinCode} * {isPinLoading && <span style={{ fontSize: '0.8rem', color: 'var(--primary)' }}> (Fetching details...)</span>}</label>
                                                    <input
                                                        className="form-input"
                                                        placeholder="6-digit PIN"
                                                        value={formData.permanent_address.pin_code}
                                                        onChange={e => handlePinChange('permanent_address', e.target.value)}
                                                    />
                                                </div>
                                                <div className="input-group">
                                                    <label>{t.houseNo} *</label>
                                                    <input className="form-input" value={formData.permanent_address.house_no} onChange={e => handleChange('permanent_address', 'house_no', e.target.value)} />
                                                </div>
                                                <div className="input-group">
                                                    <label>{t.locality} *</label>
                                                    <input className="form-input" value={formData.permanent_address.locality} onChange={e => handleChange('permanent_address', 'locality', e.target.value)} />
                                                </div>
                                                <div className="input-group">
                                                    <label>{t.village} *</label>
                                                    <input className="form-input" value={formData.permanent_address.village_town_city} onChange={e => handleChange('permanent_address', 'village_town_city', e.target.value)} />
                                                </div>
                                                <div className="input-group">
                                                    <label>{t.block}</label>
                                                    <input className="form-input" value={formData.permanent_address.block_tehsil} onChange={e => handleChange('permanent_address', 'block_tehsil', e.target.value)} />
                                                </div>
                                                <div className="input-group">
                                                    <label>{t.postOffice}</label>
                                                    <input className="form-input" value={formData.permanent_address.post_office} onChange={e => handleChange('permanent_address', 'post_office', e.target.value)} />
                                                </div>
                                                <div className="input-group">
                                                    <label>{t.policeStation}</label>
                                                    <input className="form-input" value={formData.permanent_address.police_station} onChange={e => handleChange('permanent_address', 'police_station', e.target.value)} />
                                                </div>
                                                <div className="input-group">
                                                    <label>{t.district} *</label>
                                                    <input className="form-input" value={formData.permanent_address.district} onChange={e => handleChange('permanent_address', 'district', e.target.value)} />
                                                </div>
                                                <div className="input-group">
                                                    <label>{t.state} *</label>
                                                    <input className="form-input" value={formData.permanent_address.state} onChange={e => handleChange('permanent_address', 'state', e.target.value)} />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between' }}>
                                        <button onClick={() => setStep(1)} className="cta-button" style={{ background: '#f1f5f9', color: 'var(--text-muted)' }}>
                                            ← {t.prev}
                                        </button>
                                        <button onClick={() => setStep(3)} className="cta-button" style={{ background: 'var(--primary)', color: 'white' }}>
                                            {t.next} →
                                        </button>
                                    </div>
                                </div>
                            )}


                            {step === 3 && (
                                <div className="fade-in">
                                    <h3 className="section-title"><span>🟠</span> {t.declarationTitle}</h3>

                                    <div style={{ background: '#fffbeb', padding: '25px', borderRadius: 'var(--radius)', border: '1px solid #fcd34d', marginBottom: '30px' }}>
                                        <h4 style={{ color: '#92400e', marginBottom: '12px', fontWeight: '800' }}>{t.headDecTitle}</h4>
                                        <p style={{ fontSize: '1rem', fontStyle: 'italic', marginBottom: '20px', color: '#78350f', lineHeight: '1.6' }}>{t.headDecText}</p>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontWeight: '700', color: '#92400e' }}>
                                            <input style={{ width: '20px', height: '20px', accentColor: '#D87C1D' }} type="checkbox" checked={formData.declarations.head_declared} onChange={e => handleChange('declarations', 'head_declared', e.target.checked)} />
                                            {t.agreeDec}
                                        </label>
                                    </div>

                                    <div style={{ background: '#f8fafc', padding: '25px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', marginBottom: '30px' }}>
                                        <h4 style={{ color: 'var(--text-main)', marginBottom: '15px', fontWeight: '800' }}>{t.termsTitle}</h4>
                                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '20px', display: 'grid', gap: '10px' }}>
                                            <p>{t.term1}</p>
                                            <p>{t.term2}</p>
                                            <p>{t.term3}</p>
                                            <p>{t.term4}</p>
                                            <p>{t.term5}</p>
                                        </div>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontWeight: '700', color: 'var(--text-main)' }}>
                                            <input style={{ width: '20px', height: '20px', accentColor: 'var(--primary)' }} type="checkbox" checked={formData.declarations.terms_accepted} onChange={e => handleChange('declarations', 'terms_accepted', e.target.checked)} />
                                            {t.acceptTerms}
                                        </label>
                                    </div>

                                    <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between' }}>
                                        <button onClick={() => setStep(2)} className="cta-button" style={{ background: '#f1f5f9', color: 'var(--text-muted)' }}>
                                            ← {t.prev}
                                        </button>
                                        <button
                                            onClick={handleSubmit}
                                            disabled={isSubmitting}
                                            className="cta-button"
                                            style={{
                                                background: isSubmitting ? '#cbd5e1' : 'var(--secondary)',
                                                color: 'white',
                                                padding: '14px 50px',
                                                boxShadow: isSubmitting ? 'none' : '0 10px 15px -3px rgba(22, 163, 74, 0.3)'
                                            }}
                                        >
                                            {isSubmitting ? t.submitting : t.submitBtn}
                                        </button>
                                    </div>
                                </div>
                            )}


                        </div>
                    </div>
                )}
            </div>
            {!isEmbedded && <Footer />}

            <style>{`
                * { box-sizing: border-box; }

                :root {
                    --primary: #D87C1D;
                    --primary-hover: #BF6A15;
                    --secondary: #16a34a;
                    --bg-light: #f8fafc;
                    --text-main: #1e293b;
                    --text-muted: #64748b;
                    --border: #e2e8f0;
                    --shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
                    --radius: 12px;
                }

                .container { 
                    animation: fadeIn 0.6s ease-out;
                    font-family: 'Noto Sans Devanagari', 'Inter', sans-serif;
                }

                .form-card {
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(10px);
                    padding: 40px;
                    border-radius: 24px;
                    box-shadow: 0 20px 50px -12px rgba(0, 0, 0, 0.08);
                    border: 1px solid rgba(255, 255, 255, 0.8);
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .form-card:hover {
                    box-shadow: 0 25px 60px -12px rgba(216, 124, 29, 0.1);
                }

                .section-title {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: var(--text-main);
                    padding-bottom: 12px;
                    border-bottom: 2px solid var(--bg-light);
                    margin-bottom: 30px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    line-height: 1.8;
                }

                .input-group {
                    margin-bottom: 30px;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .input-group label {
                    font-size: 0.9rem;
                    font-weight: 700;
                    color: #334155;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    line-height: 1.6;
                    margin-bottom: 6px;
                    overflow: visible;
                }

                .form-input {
                    width: 100%;
                    min-height: 60px;
                    padding: 12px 18px;
                    border-radius: var(--radius);
                    border: 1.5px solid var(--border);
                    font-size: 1.05rem;
                    font-weight: 500;
                    color: var(--text-main);
                    background: #fff;
                    line-height: 1.6;
                    transition: all 0.2s ease;
                    box-sizing: border-box;
                    display: block;
                    outline: none;
                }

                div.form-input {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .form-input:focus {
                    border-color: var(--primary);
                    outline: none;
                    box-shadow: 0 0 0 4px rgba(216, 124, 29, 0.1);
                    background: #fff;
                }

                select.form-input, 
                input.form-input {
                    padding-top: 15px !important;
                    padding-bottom: 15px !important;
                    height: auto !important;
                    line-height: normal !important;
                }

                .grid-2 {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 24px;
                }

                .cta-button {
                    padding: 12px 32px;
                    border-radius: var(--radius);
                    font-weight: 700;
                    border: none;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 1rem;
                }

                .cta-button:active { transform: scale(0.98); }

                .nav-step {
                    flex: 1;
                    padding: 14px;
                    border-radius: 14px;
                    font-weight: 700;
                    font-size: 0.9rem;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    border: 2px solid transparent;
                }

                .nav-step.active {
                    background: var(--primary);
                    color: white;
                    box-shadow: 0 10px 15px -3px rgba(216, 124, 29, 0.3);
                }

                .nav-step.inactive {
                    background: #fff;
                    color: var(--text-muted);
                    border-color: var(--border);
                }

                .nav-step:hover:not(.active) {
                    background: var(--bg-light);
                    border-color: var(--primary);
                    color: var(--primary);
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(15px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .fade-in { animation: fadeIn 0.4s ease-out; }

                @media (max-width: 768px) {
                    .grid-2 { grid-template-columns: 1fr; }
                    .form-card { padding: 25px; }
                    .nav-step { font-size: 0.8rem; padding: 10px 5px; }
                }

                .sub-section-title {
                    color: var(--primary);
                    font-size: 1.1rem;
                    font-weight: 700;
                    margin: 40px 0 20px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    border-bottom: 1.5px solid #fff7ed;
                    padding-bottom: 8px;
                }
            `}</style>

        </>
    );
};

export default RegisterFamily;
