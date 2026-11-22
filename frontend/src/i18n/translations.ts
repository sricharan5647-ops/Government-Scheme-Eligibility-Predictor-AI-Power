export type Language = 'en' | 'te' | 'hi';

export const translations = {
  en: {
    // Brand & Header
    brandName: "SchemeSathi",
    tagline: "Find the government benefits that may fit your needs.",
    home: "Home",
    exploreSchemes: "Explore Schemes",
    checkEligibility: "Check Eligibility",
    findSchemesBtn: "Find schemes for me",
    assistant: "Scheme Assistant",
    about: "About",
    privacy: "Privacy",
    admin: "Admin Portal",
    logout: "Sign Out",

    // Common Disclaimers & Notes
    disclaimerTitle: "Preliminary Eligibility Information Only",
    disclaimerNotice: "SchemeSathi is an information and preliminary screening assistant. It does not submit applications or guarantee eligibility. Final entitlement and approval is determined exclusively by the respective government department.",
    demoBadgeText: "Demo Data",
    verifiedOn: "Last verified on",
    officialSource: "Official Portal",
    
    // Status Labels
    potentialMatch: "Potential match",
    moreInfoRequired: "More information required",
    noMatch: "Does not appear to match listed criteria",
    notAssessed: "Not assessed",
    published: "Published",
    draft: "Draft",
    expired: "Expired",
    underReview: "Under Review",

    // Rule Statuses
    matched: "Condition Met",
    unmatched: "Condition Not Met",
    unknown: "Information Missing",
    needsReview: "Department Review Required",

    // Hero
    heroTitle: "Discover Welfare Schemes You May Be Eligible For",
    heroSubtitle: "A transparent, privacy-respecting eligibility screening tool for citizens of Telangana and Central Government programs. We explain every rule without guessing.",
    howItWorksTitle: "How SchemeSathi Works",
    step1Title: "1. Tell Us A Little About You",
    step1Desc: "Provide basic non-sensitive details like state, age, and occupation in under 2 minutes.",
    step2Title: "2. Deterministic Rule Matching",
    step2Desc: "Our open rule engine matches your answers against verified government guidelines without AI hallucination.",
    step3Title: "3. Clear Explanations & Next Steps",
    step3Desc: "See exactly which rules matched, what documents you need, and official links to apply directly.",

    // Categories
    categoriesTitle: "Browse by Category",
    allCategories: "All Categories",

    // Actions
    viewDetails: "View Details",
    checkMyEligibility: "Check My Eligibility",
    backToResults: "Back to Results",
    backToSchemes: "Back to Schemes",
    applyOnOfficialPortal: "Visit Official Government Portal",
    haveThisDoc: "I have this document",
    missingThisDoc: "Need to obtain",
    reportIssue: "Report Issue / Feedback",

    // Assistant
    askAssistantTitle: "SchemeSathi Grounded Assistant",
    askAssistantSubtitle: "Ask plain-language questions. Answers are strictly grounded in published, verified scheme guidelines with official source citations.",
    askPlaceholder: "e.g., What are the land rules for farmer investment in Telangana?",
    askButton: "Ask Assistant",

    // Questionnaire
    questionnaireTitle: "Check Your Scheme Eligibility",
    questionnaireSubtitle: "We collect only the minimum details required to evaluate published scheme criteria. No Aadhaar, bank details, or passwords will ever be requested.",
    stepLocation: "Location",
    stepDemographics: "Demographics",
    stepEducationWork: "Education & Work",
    stepIncomeStatus: "Income & Land",
    stepReview: "Review Answers",
    nextStep: "Continue",
    prevStep: "Back",
    evaluateBtn: "Find Matching Schemes",
    preferNotToSay: "Prefer not to say / Not sure"
  },

  te: {
    // Telugu
    brandName: "స్కీమ్ సాథి (SchemeSathi)",
    tagline: "మీ అవసరాలకు తగిన ప్రభుత్వ సంక్షేమ పథకాలను కనుగొనండి.",
    home: "హోమ్",
    exploreSchemes: "పథకాల జాబితా",
    checkEligibility: "అర్హత తనిఖీ",
    findSchemesBtn: "నాకు సరిపోయే పథకాలు",
    assistant: "సహాయక చాట్",
    about: "మా గురించి",
    privacy: "గోప్యత",
    admin: "అడ్మిన్ పోర్టల్",
    logout: "లాగ్ అవుట్",

    disclaimerTitle: "ప్రాథమిక సమాచారం మాత్రమే",
    disclaimerNotice: "స్కీమ్ సాథి ఒక ప్రాథమిక అర్హత పరిశీలనా సాధనం మాత్రమే. ఇది దరఖాస్తులను సమర్పించదు మరియు అధికారిక ఆమోదానికి హామీ ఇవ్వదు. తుది అర్హతను సంబంధిత ప్రభుత్వ శాఖ నిర్ణయిస్తుంది.",
    demoBadgeText: "డెమో సమాచారం",
    verifiedOn: "ధృవీకరించబడిన తేదీ",
    officialSource: "అధికారిక వెబ్‌సైట్",

    potentialMatch: "అర్హత ఉండే అవకాశం ఉంది",
    moreInfoRequired: "మరింత సమాచారం అవసరం",
    noMatch: "ప్రస్తుత నిబంధనల ప్రకారం సరిపోలడం లేదు",
    notAssessed: "పరిశీలించబడలేదు",
    published: "ప్రచురించబడింది",
    draft: "చిత్తుప్రతి",
    expired: "గడువు ముగిసింది",
    underReview: "సమీక్షలో ఉంది",

    matched: "నిబంధన సరిపోయింది",
    unmatched: "నిబంధన సరిపోలలేదు",
    unknown: "సమాచారం అసంపూర్ణం",
    needsReview: "అధికారిక ధృవీకరణ అవసరం",

    heroTitle: "మీకు వర్తించే ప్రభుత్వ సంక్షేమ పథకాలను తెలుసుకోండి",
    heroSubtitle: "తెలంగాణ మరియు కేంద్ర ప్రభుత్వ పథకాల కోసం పారదర్శకమైన, గోప్యతను గౌరవించే ప్రాథమిక అర్హత పరిశీలన.",
    howItWorksTitle: "స్కీమ్ సాథి ఎలా పనిచేస్తుంది?",
    step1Title: "1. సాధారణ వివరాలను ఎంచుకోండి",
    step1Desc: "రాష్ట్రం, వయస్సు, విద్య వంటి వివరాలను సురక్షితంగా అందించండి.",
    step2Title: "2. నియమాల ఆధారిత సరిపోలిక",
    step2Desc: "నిజమైన ప్రభుత్వ నిబంధనలతో నేరుగా సరిపోలుస్తాము, ఏదీ ఊహించము.",
    step3Title: "3. స్పష్టమైన వివరణ & దరఖాస్తు లింకులు",
    step3Desc: "ఏయే నిబంధనలు సరిపోయాయి, ఏ ధ్రువపత్రాలు కావాలో స్పష్టంగా తెలుసుకోండి.",

    categoriesTitle: "వర్గాల వారీగా పథకాలు",
    allCategories: "అన్ని వర్గాలు",

    viewDetails: "పూర్తి వివరాలు చూడండి",
    checkMyEligibility: "నా అర్హత తనిఖీ చేయండి",
    backToResults: "ఫలితాలకు తిరిగి వెళ్లండి",
    backToSchemes: "పథకాలకు తిరిగి వెళ్లండి",
    applyOnOfficialPortal: "అధికారిక ప్రభుత్వ పోర్టల్‌కు వెళ్లండి",
    haveThisDoc: "నా వద్ద ఈ పత్రం ఉంది",
    missingThisDoc: "ఈ పత్రం పొందాలి",
    reportIssue: "సమస్యను నివేదించండి",

    askAssistantTitle: "స్కీమ్ సాథి AI సహాయకుడు",
    askAssistantSubtitle: "మీ సందేహాలను అడగండి. అధికారిక ప్రభుత్వ మార్గదర్శకాల ఆధారంగా మాత్రమే సమాధానాలు లభిస్తాయి.",
    askPlaceholder: "ఉదాహరణకు: తెలంగాణ రైతు బంధు పథకం అర్హతలు ఏమిటి?",
    askButton: "ప్రశ్నించండి",

    questionnaireTitle: "పథక అర్హత పరిశీలన ప్రశ్నావళి",
    questionnaireSubtitle: "కనీస అవసరమైన సమాచారాన్ని మాత్రమే సేకరిస్తాము. ఆధార్, బ్యాంకు ఖాతా లేదా వ్యక్తిగత పాస్‌వర్డ్‌లు అడగబడవు.",
    stepLocation: "ప్రాంతం",
    stepDemographics: "ప్రాథమిక వివరాలు",
    stepEducationWork: "విద్య & వృత్తి",
    stepIncomeStatus: "ఆదాయం & భూమి",
    stepReview: "సమీక్షించండి",
    nextStep: "తదుపరి",
    prevStep: "వెనుకకు",
    evaluateBtn: "అర్హత గల పథకాలను కనుగొనండి",
    preferNotToSay: "చెప్పడానికి ఇష్టపడటం లేదు / తెలియదు"
  },

  hi: {
    // Hindi
    brandName: "स्कीम साथी (SchemeSathi)",
    tagline: "अपनी जरूरतों के अनुकूल सरकारी योजनाएं खोजें।",
    home: "होम",
    exploreSchemes: "योजनाएं देखें",
    checkEligibility: "पात्रता जांचें",
    findSchemesBtn: "मेरे लिए योजनाएं खोजें",
    assistant: "स्कीम सहायक",
    about: "परिचय",
    privacy: "गोपनीयता",
    admin: "एडमिन पोर्टल",
    logout: "लॉग आउट",

    disclaimerTitle: "केवल प्रारंभिक जानकारी",
    disclaimerNotice: "स्कीम साथी केवल एक प्रारंभिक जानकारी और पात्रता स्क्रीनिंग सहायक है। यह कोई आधिकारिक पोर्टल नहीं है और अंतिम निर्णय संबंधित सरकारी विभाग द्वारा ही किया जाता है।",
    demoBadgeText: "डेमो डेटा",
    verifiedOn: "सत्यापित तिथि",
    officialSource: "आधिकारिक पोर्टल",

    potentialMatch: "संभावित रूप से पात्र",
    moreInfoRequired: "अधिक जानकारी आवश्यक है",
    noMatch: "सूचीबद्ध मानदंडों से मेल नहीं खाता",
    notAssessed: "मूल्यांकन नहीं किया गया",
    published: "प्रकाशित",
    draft: "प्रारूप",
    expired: "समाप्त",
    underReview: "समीक्षाधीन",

    matched: "शर्त पूरी हुई",
    unmatched: "शर्त पूरी नहीं हुई",
    unknown: "जानकारी उपलब्ध नहीं",
    needsReview: "दस्तावेज़ सत्यापन आवश्यक",

    heroTitle: "उन सरकारी योजनाओं को खोजें जिनके आप पात्र हो सकते हैं",
    heroSubtitle: "तेलंगाना और केंद्र सरकार की कल्याणकारी योजनाओं के लिए एक पारदर्शी और सुरक्षित पात्रता स्क्रीनिंग सहायक।",
    howItWorksTitle: "स्कीम साथी कैसे काम करता है?",
    step1Title: "1. अपनी सामान्य जानकारी दें",
    step1Desc: "राज्य, आयु और व्यवसाय जैसी न्यूनतम आवश्यक जानकारी भरें।",
    step2Title: "2. सत्यापित नियमों से मिलान",
    step2Desc: "आधिकारिक सरकारी नियमों के आधार पर पारदर्शी मिलान किया जाता है।",
    step3Title: "3. स्पष्ट कारण व आधिकारिक लिंक",
    step3Desc: "देखें कि कौन से नियम पूरे हुए और आवेदन के लिए आधिकारिक पोर्टल पर जाएं।",

    categoriesTitle: "श्रेणियों के आधार पर योजनाएं",
    allCategories: "सभी श्रेणियां",

    viewDetails: "विवरण देखें",
    checkMyEligibility: "मेरी पात्रता जांचें",
    backToResults: "परिणामों पर वापस जाएं",
    backToSchemes: "योजनाओं पर वापस जाएं",
    applyOnOfficialPortal: "आधिकारिक सरकारी पोर्टल पर जाएं",
    haveThisDoc: "मेरे पास यह दस्तावेज़ है",
    missingThisDoc: "दस्तावेज़ प्राप्त करना होगा",
    reportIssue: "समस्या बताएं / सुझाव दें",

    askAssistantTitle: "स्कीम साथी AI सहायक",
    askAssistantSubtitle: "योजनाओं से संबंधित प्रश्न पूछें। उत्तर केवल आधिकारिक व सत्यापित दिशानिर्देशों पर आधारित होते हैं।",
    askPlaceholder: "जैसे: तेलंगाना में किसान सहायता योजना के क्या नियम हैं?",
    askButton: "प्रश्न पूछें",

    questionnaireTitle: "पात्रता मूल्यांकन प्रश्नावली",
    questionnaireSubtitle: "हम केवल आवश्यक जानकारी ही लेते हैं। आधार नंबर या बैंक विवरण कभी नहीं मांगा जाता।",
    stepLocation: "स्थान",
    stepDemographics: "सामान्य जानकारी",
    stepEducationWork: "शिक्षा और कार्य",
    stepIncomeStatus: "आय और भूमि विवरण",
    stepReview: "समीक्षा करें",
    nextStep: "आगे बढ़ें",
    prevStep: "पीछे जाएं",
    evaluateBtn: "योजनाएं खोजें",
    preferNotToSay: "बताना नहीं चाहते / अनिश्चित"
  }
};
