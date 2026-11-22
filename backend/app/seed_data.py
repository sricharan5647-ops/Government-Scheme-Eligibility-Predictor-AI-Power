import json
import datetime
from sqlalchemy.orm import Session
from .models import Scheme, EligibilityRule, RequiredDocument, SchemeSource, User, AuditLog
from .services.auth import hash_password

def seed_database(db: Session):
    """Seed initial administrator accounts, official schemes, and clearly labelled demo schemes."""
    # Check if already seeded
    if db.query(User).count() > 0 and db.query(Scheme).count() > 0:
        return

    # 1. Seed Administrators
    admin_user = User(
        email="admin@schemesathi.in",
        password_hash=hash_password("Admin@SchemeSathi2025!"),
        role="platform_admin",
        is_active=True,
        created_at=datetime.datetime.now(datetime.timezone.utc)
    )
    editor_user = User(
        email="editor@schemesathi.in",
        password_hash=hash_password("Editor@SchemeSathi2025!"),
        role="scheme_admin",
        is_active=True,
        created_at=datetime.datetime.now(datetime.timezone.utc)
    )
    db.add(admin_user)
    db.add(editor_user)
    db.commit()
    db.refresh(admin_user)

    now = datetime.datetime.now(datetime.timezone.utc)

    # 2. Scheme Definitions
    schemes_data = [
        # --- Scheme 1: Rythu Bandhu / Rythu Bharosa (Telangana Agriculture) ---
        {
            "slug": "telangana-rythu-bandhu",
            "official_name": "Rythu Bandhu (Agriculture Investment Support Scheme)",
            "short_description": "Direct financial investment support to resident farmers in Telangana for agricultural inputs per season.",
            "plain_language_description": "Rythu Bandhu helps Telangana farmers purchase seeds, fertilizers, and field inputs. It provides direct financial assistance per acre per season for patta land owners.",
            "department": "Department of Agriculture, Government of Telangana",
            "government_level": "state",
            "state_code": "TG",
            "category": "Agriculture & Allied",
            "beneficiary_groups": ["Farmers", "Agricultural Landowners"],
            "benefit_summary": "Financial grant of Rs. 5,000 to Rs. 7,500 per acre per season transferred directly to eligible farmers' bank accounts.",
            "application_steps": [
                "Verify that your agricultural land title (Pattadar Passbook) is updated on the Dharani portal.",
                "Ensure your bank account is linked with your Aadhaar and Dharani passbook record.",
                "Submit bank account details to the Agriculture Extension Officer (AEO) of your revenue village.",
                "AEO verifies land holding details and submits to the district treasury for direct bank transfer."
            ],
            "official_application_url": "https://rythubandhu.telangana.gov.in/",
            "status": "published",
            "is_demo": False,
            "last_verified_at": datetime.datetime(2025, 1, 15),
            "sources": [
                {
                    "source_title": "Telangana Rythu Bandhu Portal & Guidelines",
                    "official_url": "https://rythubandhu.telangana.gov.in/",
                    "source_type": "portal_page",
                    "verified_at": datetime.datetime(2025, 1, 15),
                    "source_excerpt": "Assistance is provided for purchase of inputs like seeds, fertilizers, pesticides, and field operations to all farmer titleholders in Telangana."
                }
            ],
            "documents": [
                {"document_name": "Pattadar Passbook / Dharani Record", "description": "Proof of agricultural landholding in Telangana.", "is_mandatory": True},
                {"document_name": "Aadhaar Card", "description": "Identity verification matching land record name.", "is_mandatory": True},
                {"document_name": "Bank Passbook Copy", "description": "Nationalized or cooperative bank account linked with Aadhaar.", "is_mandatory": True}
            ],
            "rules": [
                {
                    "field_key": "state_code",
                    "operator": "equals",
                    "expected_value": "TG",
                    "is_mandatory": True,
                    "plain_language_text": "Must be an agricultural landholder in the State of Telangana."
                },
                {
                    "field_key": "farmer_status",
                    "operator": "equals",
                    "expected_value": "true",
                    "is_mandatory": True,
                    "plain_language_text": "Must be engaged in farming and hold patta agricultural land."
                },
                {
                    "field_key": "landholding_acres",
                    "operator": "greater_than",
                    "expected_value": "0",
                    "is_mandatory": True,
                    "plain_language_text": "Must own at least some documented agricultural land (greater than 0 acres)."
                }
            ]
        },

        # --- Scheme 2: Telangana Overseas Scholarship (Education) ---
        {
            "slug": "telangana-overseas-scholarship",
            "official_name": "Chief Minister's Overseas Scholarship Scheme for SC/ST/BC/Minorities",
            "short_description": "Financial assistance of up to Rs. 20 Lakhs for eligible students from Telangana pursuing postgraduate or doctoral studies abroad.",
            "plain_language_description": "Helps meritorious graduate students from backward and minority communities in Telangana pursue Master's or Ph.D. degrees in top international universities across USA, UK, Canada, Australia, and Germany.",
            "department": "Scheduled Castes / BC Development Department, Government of Telangana",
            "government_level": "state",
            "state_code": "TG",
            "category": "Education & Learning",
            "beneficiary_groups": ["Students", "Graduates", "Youth"],
            "benefit_summary": "Grant of up to Rs. 20 Lakhs or actual fees (whichever is lower) plus one economy air ticket and visa processing support.",
            "application_steps": [
                "Secure admission to an accredited university in approved countries (USA, UK, Australia, Canada, etc.).",
                "Take eligible test scores (GRE/GMAT and TOEFL/IELTS).",
                "Apply online via the Telangana ePASS overseas portal during open registration cycles.",
                "Upload income certificate, caste certificate, degree marks memo, and university I-20 or offer letter.",
                "Attend state-level screening committee interview if shortlisted."
            ],
            "official_application_url": "https://telanganaepass.cgg.gov.in/",
            "status": "published",
            "is_demo": False,
            "last_verified_at": datetime.datetime(2025, 2, 10),
            "sources": [
                {
                    "source_title": "Telangana ePASS Overseas Vidya Nidhi Official Notification",
                    "official_url": "https://telanganaepass.cgg.gov.in/",
                    "source_type": "gazette_notification",
                    "verified_at": datetime.datetime(2025, 2, 10),
                    "source_excerpt": "Assistance up to Rs. 20 Lakhs for candidates with family income not exceeding Rs. 5.00 Lakhs per annum and age below 35 years."
                }
            ],
            "documents": [
                {"document_name": "University Admission Letter / I-20", "description": "Unconditional offer letter from recognized foreign university.", "is_mandatory": True},
                {"document_name": "Income Certificate", "description": "Issued by MeeSeva / Tahsildar showing annual family income under Rs. 5 Lakhs.", "is_mandatory": True},
                {"document_name": "Community / Caste Certificate", "description": "SC, ST, BC, or Minority certificate issued by competent revenue authority.", "is_mandatory": True},
                {"document_name": "Undergraduate Degree Certificate & Transcripts", "description": "Proof of graduation with at least 60% marks.", "is_mandatory": True}
            ],
            "rules": [
                {
                    "field_key": "state_code",
                    "operator": "equals",
                    "expected_value": "TG",
                    "is_mandatory": True,
                    "plain_language_text": "Must be a native resident of Telangana."
                },
                {
                    "field_key": "age",
                    "operator": "less_than_or_equal",
                    "expected_value": "35",
                    "is_mandatory": True,
                    "plain_language_text": "Age must be 35 years or younger at the time of application."
                },
                {
                    "field_key": "annual_household_income",
                    "operator": "less_than_or_equal",
                    "expected_value": "500000",
                    "is_mandatory": True,
                    "plain_language_text": "Total annual family income from all sources must not exceed Rs. 5,00,000."
                },
                {
                    "field_key": "education_level",
                    "operator": "in_list",
                    "expected_value": "graduate,post_graduate",
                    "is_mandatory": True,
                    "plain_language_text": "Must have completed an undergraduate or postgraduate degree."
                },
                {
                    "field_key": "social_category",
                    "operator": "in_list",
                    "expected_value": "sc,st,bc,minority",
                    "is_mandatory": True,
                    "plain_language_text": "Must belong to SC, ST, BC, or Minority community as per official notification."
                }
            ]
        },

        # --- Scheme 3: Rajiv Aarogyasri Health Scheme (Healthcare - Telangana) ---
        {
            "slug": "telangana-aarogyasri",
            "official_name": "Rajiv Aarogyasri Community Health Scheme",
            "short_description": "Cashless secondary and tertiary hospitalization treatment up to Rs. 10 Lakhs for eligible BPL families in Telangana.",
            "plain_language_description": "Provides free healthcare and hospitalization for identified critical illnesses and surgeries to below-poverty-line families across network private and government hospitals in Telangana.",
            "department": "Aarogyasri Health Care Trust, Department of Health, Medical & Family Welfare, Telangana",
            "government_level": "state",
            "state_code": "TG",
            "category": "Healthcare & Wellness",
            "beneficiary_groups": ["BPL Families", "Low-Income Households", "Senior Citizens"],
            "benefit_summary": "Cashless medical treatment, surgery, and post-operative medications up to Rs. 10 Lakhs per family per year.",
            "application_steps": [
                "Visit the Aarogya Mithra desk at any government or empaneled private hospital in Telangana.",
                "Present your Food Security Card (White Ration Card) or Aarogyasri health card.",
                "Hospital specialist initiates pre-authorization request with Aarogyasri Trust.",
                "Upon automatic approval, cashless treatment, operation, and medicines are provided."
            ],
            "official_application_url": "https://aarogyasri.telangana.gov.in/",
            "status": "published",
            "is_demo": False,
            "last_verified_at": datetime.datetime(2025, 1, 20),
            "sources": [
                {
                    "source_title": "Aarogyasri Health Care Trust Official Portal",
                    "official_url": "https://aarogyasri.telangana.gov.in/",
                    "source_type": "portal_page",
                    "verified_at": datetime.datetime(2025, 1, 20),
                    "source_excerpt": "Coverage enhanced to Rs. 10 Lakhs per BPL family holding Telangana Food Security (White) Ration Card."
                }
            ],
            "documents": [
                {"document_name": "Food Security Card / White Ration Card", "description": "Issued by Telangana Civil Supplies Department.", "is_mandatory": True},
                {"document_name": "Aadhaar Card", "description": "Of the patient and family head.", "is_mandatory": True}
            ],
            "rules": [
                {
                    "field_key": "state_code",
                    "operator": "equals",
                    "expected_value": "TG",
                    "is_mandatory": True,
                    "plain_language_text": "Must be a resident of Telangana."
                },
                {
                    "field_key": "has_bpl_ration_card",
                    "operator": "equals",
                    "expected_value": "true",
                    "is_mandatory": True,
                    "plain_language_text": "Must hold an active Food Security Card (White/BPL Ration Card) in Telangana."
                }
            ]
        },

        # --- Scheme 4: PM-KISAN (Central Agriculture) ---
        {
            "slug": "pm-kisan-samman-nidhi",
            "official_name": "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
            "short_description": "Central income support of Rs. 6,000 per year in three equal installments to all landholding farmer families across India.",
            "plain_language_description": "Central Government scheme that provides direct income assistance to landholding farmer families to supplement their financial needs for agricultural inputs and domestic expenses.",
            "department": "Ministry of Agriculture & Farmers Welfare, Government of India",
            "government_level": "central",
            "state_code": None,
            "category": "Agriculture & Allied",
            "beneficiary_groups": ["Farmers", "Small Landowners"],
            "benefit_summary": "Rs. 6,000 per year transferred in 3 equal installments of Rs. 2,000 directly to beneficiary bank accounts.",
            "application_steps": [
                "Visit pmkisan.gov.in or visit a Common Service Centre (CSC).",
                "Select 'New Farmer Registration' and enter your Aadhaar and mobile number.",
                "Enter state, district, sub-district, village, land khata/survey number, and bank account details.",
                "Complete mandatory e-KYC using OTP or biometric verification."
            ],
            "official_application_url": "https://pmkisan.gov.in/",
            "status": "published",
            "is_demo": False,
            "last_verified_at": datetime.datetime(2025, 2, 1),
            "sources": [
                {
                    "source_title": "PM-KISAN Official Operational Guidelines",
                    "official_url": "https://pmkisan.gov.in/",
                    "source_type": "guideline_doc",
                    "verified_at": datetime.datetime(2025, 2, 1),
                    "source_excerpt": "Under the scheme, Rs. 6,000/- per year is given in three 4-monthly installments to all cultivable landholding farmer families."
                }
            ],
            "documents": [
                {"document_name": "Aadhaar Card", "description": "Mandatory for registration and Aadhaar-linked e-KYC.", "is_mandatory": True},
                {"document_name": "Land Ownership Record / Record of Rights", "description": "Valid landholding documents in applicant's name.", "is_mandatory": True},
                {"document_name": "Aadhaar-Seeded Bank Account Details", "description": "Active bank account linked with NPCI Aadhaar bridge.", "is_mandatory": True}
            ],
            "rules": [
                {
                    "field_key": "farmer_status",
                    "operator": "equals",
                    "expected_value": "true",
                    "is_mandatory": True,
                    "plain_language_text": "Must be a cultivable landholding farmer family."
                },
                {
                    "field_key": "landholding_acres",
                    "operator": "greater_than",
                    "expected_value": "0",
                    "is_mandatory": True,
                    "plain_language_text": "Must own cultivable agricultural land registered in official revenue records."
                }
            ]
        },

        # --- Scheme 5: Ayushman Bharat (AB-PMJAY) (Central Healthcare) ---
        {
            "slug": "ayushman-bharat-pmjay",
            "official_name": "Ayushman Bharat - Pradhan Mantri Jan Arogya Yojana (AB-PMJAY)",
            "short_description": "Health coverage of up to Rs. 5 Lakhs per family per year for secondary and tertiary care hospitalization across India.",
            "plain_language_description": "The world's largest government-funded healthcare assurance scheme, offering cashless access to medical treatments for vulnerable families identified through socioeconomic criteria.",
            "department": "National Health Authority, Ministry of Health and Family Welfare, Government of India",
            "government_level": "central",
            "state_code": None,
            "category": "Healthcare & Wellness",
            "beneficiary_groups": ["BPL Families", "Low-Income Households", "Senior Citizens"],
            "benefit_summary": "Health insurance cover of up to Rs. 5,00,000 per family per year for secondary and tertiary hospital care.",
            "application_steps": [
                "Check your eligibility on beneficiary.nha.gov.in or call toll-free helpline 14555.",
                "Visit nearest Ayushman Arogya Mandir, CSC, or empaneled hospital with Aadhaar and ration card.",
                "Complete e-KYC to generate your Ayushman Card (golden card).",
                "Present the card at any empaneled hospital nationwide for cashless treatment."
            ],
            "official_application_url": "https://pmjay.gov.in/",
            "status": "published",
            "is_demo": False,
            "last_verified_at": datetime.datetime(2025, 1, 10),
            "sources": [
                {
                    "source_title": "National Health Authority AB-PMJAY Portal",
                    "official_url": "https://pmjay.gov.in/",
                    "source_type": "portal_page",
                    "verified_at": datetime.datetime(2025, 1, 10),
                    "source_excerpt": "Provides a benefit cover of Rs. 5 lakh per family per year for secondary and tertiary care hospitalization."
                }
            ],
            "documents": [
                {"document_name": "Aadhaar Card", "description": "Mandatory identity proof for biometric e-KYC.", "is_mandatory": True},
                {"document_name": "Ration Card or SECC Proof", "description": "Proof of inclusion in eligible socio-economic category.", "is_mandatory": True}
            ],
            "rules": [
                {
                    "field_key": "has_bpl_ration_card",
                    "operator": "equals",
                    "expected_value": "true",
                    "is_mandatory": True,
                    "plain_language_text": "Must be an eligible low-income or BPL household with recognized food security or ration card."
                }
            ]
        },

        # --- Scheme 6: Pradhan Mantri Awas Yojana - Urban (Housing) ---
        {
            "slug": "pm-awas-yojana-urban",
            "official_name": "Pradhan Mantri Awas Yojana - Urban (PMAY-U)",
            "short_description": "Credit-linked interest subsidy and financial assistance for constructing or purchasing pucca houses for urban families.",
            "plain_language_description": "Helps urban homeless and low-income families build or purchase their own pucca house with government subsidies and lower home loan interest rates.",
            "department": "Ministry of Housing and Urban Affairs, Government of India",
            "government_level": "central",
            "state_code": None,
            "category": "Housing & Shelter",
            "beneficiary_groups": ["Urban Poor", "Economically Weaker Section (EWS)", "Low Income Group (LIG)"],
            "benefit_summary": "Financial assistance of Rs. 1.5 Lakhs to Rs. 2.5 Lakhs or interest subsidy of up to 6.5% on housing loans.",
            "application_steps": [
                "Visit pmaymis.gov.in or contact the municipal corporation / municipality office.",
                "Under 'Citizen Assessment', choose the appropriate component (e.g. Beneficiary Led Construction).",
                "Enter Aadhaar number and fill applicant details including urban local body and family income.",
                "Urban local body carries out physical verification and geo-tagging."
            ],
            "official_application_url": "https://pmaymis.gov.in/",
            "status": "published",
            "is_demo": False,
            "last_verified_at": datetime.datetime(2025, 1, 28),
            "sources": [
                {
                    "source_title": "PMAY-U Operational Guidelines",
                    "official_url": "https://pmaymis.gov.in/",
                    "source_type": "guideline_doc",
                    "verified_at": datetime.datetime(2025, 1, 28),
                    "source_excerpt": "Beneficiary family should not own a pucca house in any part of India. EWS annual income up to Rs. 3,00,000; LIG up to Rs. 6,00,000."
                }
            ],
            "documents": [
                {"document_name": "Aadhaar Card of Family Members", "description": "Identity verification for all adult family members.", "is_mandatory": True},
                {"document_name": "Income Certificate / Salary Slip", "description": "Showing household income within EWS/LIG limit (under Rs. 6 Lakhs).", "is_mandatory": True},
                {"document_name": "Land / Plot Ownership Documents", "description": "For beneficiary-led construction component.", "is_mandatory": False}
            ],
            "rules": [
                {
                    "field_key": "annual_household_income",
                    "operator": "less_than_or_equal",
                    "expected_value": "600000",
                    "is_mandatory": True,
                    "plain_language_text": "Annual household income must not exceed Rs. 6,00,000 (EWS/LIG category)."
                }
            ]
        },

        # --- Scheme 7: National Apprenticeship Promotion Scheme (Employment) ---
        {
            "slug": "national-apprenticeship-promotion-scheme",
            "official_name": "National Apprenticeship Promotion Scheme (NAPS)",
            "short_description": "Direct industry skill training and monthly stipend co-funded by Government for youth and job seekers.",
            "plain_language_description": "Enables youth to receive hands-on technical and corporate apprenticeship training with recognized industries, receiving a monthly stipend co-funded by the Central Government.",
            "department": "Ministry of Skill Development & Entrepreneurship, Government of India",
            "government_level": "central",
            "state_code": None,
            "category": "Employment & Skills",
            "beneficiary_groups": ["Youth", "Job Seekers", "ITI / Diploma / College Graduates"],
            "benefit_summary": "Monthly stipend ranging from Rs. 5,000 to Rs. 9,000 during apprenticeship training, with direct Government contribution of up to Rs. 1,500/month.",
            "application_steps": [
                "Register on the Apprenticeship India portal (apprenticeshipindia.gov.in).",
                "Complete candidate profile and upload educational certificates.",
                "Search and apply for apprenticeship opportunities in desired trade and location.",
                "Sign the apprenticeship contract online once selected by an employer."
            ],
            "official_application_url": "https://www.apprenticeshipindia.gov.in/",
            "status": "published",
            "is_demo": False,
            "last_verified_at": datetime.datetime(2025, 2, 5),
            "sources": [
                {
                    "source_title": "MSDE Apprenticeship Portal Guidelines",
                    "official_url": "https://www.apprenticeshipindia.gov.in/",
                    "source_type": "guideline_doc",
                    "verified_at": datetime.datetime(2025, 2, 5),
                    "source_excerpt": "Applicants must be at least 14 years of age and meet the minimum educational qualification prescribed for the trade."
                }
            ],
            "documents": [
                {"document_name": "Aadhaar Card", "description": "Identity and age verification.", "is_mandatory": True},
                {"document_name": "Educational Certificate (10th/12th/ITI/Diploma/Degree)", "description": "Proof of required educational qualification.", "is_mandatory": True},
                {"document_name": "Bank Account Details", "description": "For direct stipend benefit transfer.", "is_mandatory": True}
            ],
            "rules": [
                {
                    "field_key": "age",
                    "operator": "between",
                    "expected_value": "14,35",
                    "is_mandatory": True,
                    "plain_language_text": "Must be between 14 and 35 years of age."
                },
                {
                    "field_key": "education_level",
                    "operator": "in_list",
                    "expected_value": "10th_pass,12th_pass,diploma,graduate",
                    "is_mandatory": True,
                    "plain_language_text": "Must hold at least a 10th standard pass certificate or higher."
                }
            ]
        },

        # --- Scheme 8: Pradhan Mantri Matru Vandana Yojana (Women Welfare) ---
        {
            "slug": "pm-matru-vandana-yojana",
            "official_name": "Pradhan Mantri Matru Vandana Yojana (PMMVY)",
            "short_description": "Maternity cash incentive of Rs. 5,000 to pregnant women and lactating mothers for health, nutrition, and wage compensation.",
            "plain_language_description": "Provides financial support directly into the bank account of pregnant women and lactating mothers for improved nutrition and healthcare during first and second pregnancies.",
            "department": "Ministry of Women and Child Development, Government of India",
            "government_level": "central",
            "state_code": None,
            "category": "Women & Child Welfare",
            "beneficiary_groups": ["Pregnant Women", "Lactating Mothers"],
            "benefit_summary": "Cash benefit of Rs. 5,000 for the first child in two installments, and Rs. 6,000 for the second child (if female) in one installment.",
            "application_steps": [
                "Register pregnancy at the local Anganwadi Centre (AWC) or approved health facility within 570 days of LMP.",
                "Fill Form 1-A with the Anganwadi Worker (AWW) or ASHA worker.",
                "Provide MCP card (Mother and Child Protection) details showing antenatal check-ups.",
                "Amount transferred directly via Direct Benefit Transfer (DBT)."
            ],
            "official_application_url": "https://pmmvy.wcd.gov.in/",
            "status": "published",
            "is_demo": False,
            "last_verified_at": datetime.datetime(2025, 1, 18),
            "sources": [
                {
                    "source_title": "PMMVY Scheme Guidelines & Portal",
                    "official_url": "https://pmmvy.wcd.gov.in/",
                    "source_type": "guideline_doc",
                    "verified_at": datetime.datetime(2025, 1, 18),
                    "source_excerpt": "Eligible pregnant women and lactating mothers aged 19 years and above receiving benefits under DBT mode."
                }
            ],
            "documents": [
                {"document_name": "Mother and Child Protection (MCP) Card", "description": "Showing registration and mandatory antenatal checkups.", "is_mandatory": True},
                {"document_name": "Aadhaar Card of Mother", "description": "Identity verification and DBT linking.", "is_mandatory": True},
                {"document_name": "Bank Passbook Copy", "description": "Single account in mother's name linked with Aadhaar.", "is_mandatory": True}
            ],
            "rules": [
                {
                    "field_key": "gender",
                    "operator": "equals",
                    "expected_value": "female",
                    "is_mandatory": True,
                    "plain_language_text": "Applicant must be female."
                },
                {
                    "field_key": "age",
                    "operator": "greater_than_or_equal",
                    "expected_value": "19",
                    "is_mandatory": True,
                    "plain_language_text": "Mother must be 19 years of age or older at the time of pregnancy."
                }
            ]
        },

        # --- Scheme 9: Telangana Dalit Bandhu (Entrepreneurship) ---
        {
            "slug": "telangana-dalit-bandhu",
            "official_name": "Telangana Dalit Bandhu Scheme",
            "short_description": "One-time direct financial grant of Rs. 10 Lakhs per eligible Dalit family for establishing independent enterprises.",
            "plain_language_description": "Flagship economic empowerment initiative providing a 100% direct grant (not a loan) of Rs. 10 Lakhs to Dalit families in Telangana to start businesses in transport, manufacturing, services, or agriculture.",
            "department": "Scheduled Castes Development Department, Government of Telangana",
            "government_level": "state",
            "state_code": "TG",
            "category": "Entrepreneurship & Business",
            "beneficiary_groups": ["Dalit Families", "SC Entrepreneurs"],
            "benefit_summary": "Direct financial capital grant of Rs. 10,00,000 per family without bank loan burden or repayment requirement.",
            "application_steps": [
                "Identification and survey conducted by the District Collector and revenue officials.",
                "Beneficiary selects chosen business/enterprise model from approved sectors.",
                "Special bank account opened under Dalit Bandhu Scheme.",
                "Funds deposited directly and units grounded under district administration supervision."
            ],
            "official_application_url": "https://dalitbandhu.telangana.gov.in/",
            "status": "published",
            "is_demo": False,
            "last_verified_at": datetime.datetime(2025, 1, 25),
            "sources": [
                {
                    "source_title": "Telangana Dalit Bandhu Portal & G.O. Ms.",
                    "official_url": "https://dalitbandhu.telangana.gov.in/",
                    "source_type": "gazette_notification",
                    "verified_at": datetime.datetime(2025, 1, 25),
                    "source_excerpt": "Scheme intended to promote self-employment and enterprise development among SC households in Telangana."
                }
            ],
            "documents": [
                {"document_name": "SC Caste Certificate", "description": "Valid community certificate issued by Revenue Department.", "is_mandatory": True},
                {"document_name": "Food Security Card / Ration Card", "description": "Proof of family unit in Telangana.", "is_mandatory": True},
                {"document_name": "Aadhaar Card", "description": "Matching applicant and family details.", "is_mandatory": True}
            ],
            "rules": [
                {
                    "field_key": "state_code",
                    "operator": "equals",
                    "expected_value": "TG",
                    "is_mandatory": True,
                    "plain_language_text": "Must be a native resident of Telangana."
                },
                {
                    "field_key": "social_category",
                    "operator": "equals",
                    "expected_value": "sc",
                    "is_mandatory": True,
                    "plain_language_text": "Must belong to the Scheduled Caste (SC) community."
                }
            ]
        },

        # --- Scheme 10: Telangana Aasara Pension (Social Security) ---
        {
            "slug": "telangana-aasara-pensions",
            "official_name": "Telangana Aasara Pensions (Old Age & Social Security)",
            "short_description": "Monthly financial pension of Rs. 2,016 for senior citizens, widows, and vulnerable citizens in Telangana.",
            "plain_language_description": "Provides dignified social security through monthly financial pensions to senior citizens above 57 years, destitute widows, and physically challenged persons in Telangana.",
            "department": "Panchayat Raj & Rural Development Department, Government of Telangana",
            "government_level": "state",
            "state_code": "TG",
            "category": "Social Security & Welfare",
            "beneficiary_groups": ["Senior Citizens", "Widows", "Disabled Persons"],
            "benefit_summary": "Monthly pension of Rs. 2,016 (Rs. 4,016 for persons with disability) paid through post office / biometric direct bank transfer.",
            "application_steps": [
                "Obtain application form from local Gram Panchayat or MeeSeva centre.",
                "Attach proof of age, residence, and income certificate.",
                "Submit form to the Panchayat Secretary (rural) or Bill Collector (urban).",
                "Field verification conducted by MPDO / Municipal Commissioner before sanction."
            ],
            "official_application_url": "https://aasara.telangana.gov.in/",
            "status": "published",
            "is_demo": False,
            "last_verified_at": datetime.datetime(2025, 2, 8),
            "sources": [
                {
                    "source_title": "Telangana Aasara Official Portal",
                    "official_url": "https://aasara.telangana.gov.in/",
                    "source_type": "portal_page",
                    "verified_at": datetime.datetime(2025, 2, 8),
                    "source_excerpt": "Eligibility age for old age pension reduced to 57 years for BPL households in Telangana."
                }
            ],
            "documents": [
                {"document_name": "Age Proof (Voter ID / School Certificate)", "description": "Showing age 57 years or above.", "is_mandatory": True},
                {"document_name": "Food Security Card / BPL Ration Card", "description": "Showing family residence in Telangana.", "is_mandatory": True},
                {"document_name": "Bank / Post Office Passbook", "description": "Active savings account for monthly pension deposit.", "is_mandatory": True}
            ],
            "rules": [
                {
                    "field_key": "state_code",
                    "operator": "equals",
                    "expected_value": "TG",
                    "is_mandatory": True,
                    "plain_language_text": "Must be a permanent resident of Telangana."
                },
                {
                    "field_key": "age",
                    "operator": "greater_than_or_equal",
                    "expected_value": "57",
                    "is_mandatory": True,
                    "plain_language_text": "Age must be 57 years or older for Old Age Pension."
                },
                {
                    "field_key": "annual_household_income",
                    "operator": "less_than_or_equal",
                    "expected_value": "150000",
                    "is_mandatory": True,
                    "plain_language_text": "Annual family income must not exceed Rs. 1,50,000 (rural) or Rs. 2,00,000 (urban)."
                }
            ]
        },

        # --- Scheme 11: Demo AI Innovation Fellowship [DEMO DATA] ---
        {
            "slug": "demo-ai-innovation-fellowship",
            "official_name": "Civic AI Innovation Fellowship [Demo Data]",
            "short_description": "Demo data - not an official government scheme. Illustrative program for open-source public service research.",
            "plain_language_description": "Demo data - not an official government scheme. This sample scheme is provided for testing the eligibility rule engine on educational and age criteria.",
            "department": "National Innovation Testing Lab (Demo Department)",
            "government_level": "central",
            "state_code": None,
            "category": "Education & Learning",
            "beneficiary_groups": ["Students", "Young Researchers"],
            "benefit_summary": "Demo stipend of Rs. 25,000/month for testing eligibility flows.",
            "application_steps": [
                "Demo step 1: Complete online profile.",
                "Demo step 2: Submit sample open source proposal."
            ],
            "official_application_url": "https://example.gov.in/demo-ai-fellowship",
            "status": "published",
            "is_demo": True,
            "last_verified_at": datetime.datetime(2025, 1, 1),
            "sources": [
                {
                    "source_title": "SchemeSathi Demo Data Testing Suite",
                    "official_url": "https://example.gov.in/demo-ai-fellowship",
                    "source_type": "official_faq",
                    "verified_at": datetime.datetime(2025, 1, 1),
                    "source_excerpt": "Demo data used exclusively for platform testing and rule engine validation.",
                    "is_official": False
                }
            ],
            "documents": [
                {"document_name": "Demo Degree Certificate", "description": "Demo requirement.", "is_mandatory": True}
            ],
            "rules": [
                {
                    "field_key": "age",
                    "operator": "between",
                    "expected_value": "18,28",
                    "is_mandatory": True,
                    "plain_language_text": "Must be between 18 and 28 years of age."
                },
                {
                    "field_key": "education_level",
                    "operator": "in_list",
                    "expected_value": "graduate,post_graduate",
                    "is_mandatory": True,
                    "plain_language_text": "Must be a college graduate or postgraduate."
                }
            ]
        },

        # --- Scheme 12: Historical Rooftop Solar Grant [EXPIRED DEMO] ---
        {
            "slug": "demo-expired-solar-grant",
            "official_name": "Pilot Rooftop Solar Phase 1 [Expired Demo Scheme]",
            "short_description": "Demo data - not an official government scheme. Archived testing record for validating expired scheme filters.",
            "plain_language_description": "Demo data - not an official government scheme. This record has an expired validity date to verify that expired opportunities are not recommended.",
            "department": "Ministry of Energy Test Lab (Demo)",
            "government_level": "central",
            "state_code": None,
            "category": "Housing & Shelter",
            "beneficiary_groups": ["Homeowners"],
            "benefit_summary": "Expired capital subsidy of 40% on solar panels.",
            "application_steps": [
                "This scheme window is permanently closed."
            ],
            "official_application_url": "https://example.gov.in/expired-solar",
            "status": "expired",
            "is_demo": True,
            "last_verified_at": datetime.datetime(2023, 12, 31),
            "sources": [
                {
                    "source_title": "Archived Solar Phase 1 Notification",
                    "official_url": "https://example.gov.in/expired-solar",
                    "source_type": "guideline_doc",
                    "verified_at": datetime.datetime(2023, 12, 31),
                    "source_excerpt": "Program concluded on December 31, 2023.",
                    "is_official": False
                }
            ],
            "documents": [],
            "rules": [
                {
                    "field_key": "age",
                    "operator": "greater_than_or_equal",
                    "expected_value": "21",
                    "is_mandatory": True,
                    "plain_language_text": "Must be 21 years of age."
                }
            ]
        }
    ]

    for item in schemes_data:
        bg_str = json.dumps(item["beneficiary_groups"])
        steps_str = json.dumps(item["application_steps"])

        scheme = Scheme(
            slug=item["slug"],
            official_name=item["official_name"],
            short_description=item["short_description"],
            plain_language_description=item["plain_language_description"],
            department=item["department"],
            government_level=item["government_level"],
            state_code=item["state_code"],
            category=item["category"],
            beneficiary_groups=bg_str,
            benefit_summary=item["benefit_summary"],
            application_steps=steps_str,
            official_application_url=item["official_application_url"],
            status=item["status"],
            is_demo=item["is_demo"],
            last_verified_at=item["last_verified_at"],
            created_at=now,
            updated_at=now
        )
        db.add(scheme)
        db.commit()
        db.refresh(scheme)

        # Sources
        for src in item.get("sources", []):
            db_src = SchemeSource(
                scheme_id=scheme.id,
                source_title=src["source_title"],
                official_url=src["official_url"],
                source_type=src["source_type"],
                verified_at=src["verified_at"],
                source_excerpt=src.get("source_excerpt"),
                is_official=src.get("is_official", True)
            )
            db.add(db_src)

        # Documents
        for doc in item.get("documents", []):
            db_doc = RequiredDocument(
                scheme_id=scheme.id,
                document_name=doc["document_name"],
                description=doc.get("description"),
                is_mandatory=doc.get("is_mandatory", True)
            )
            db.add(db_doc)

        # Rules
        for r in item.get("rules", []):
            db_rule = EligibilityRule(
                scheme_id=scheme.id,
                field_key=r["field_key"],
                operator=r["operator"],
                expected_value=r["expected_value"],
                is_mandatory=r["is_mandatory"],
                plain_language_text=r["plain_language_text"],
                version=1
            )
            db.add(db_rule)

    # Initial Audit Log
    audit = AuditLog(
        admin_user_id=admin_user.id,
        action="seed_system",
        entity_type="system",
        entity_id=None,
        timestamp=now,
        change_summary=f"Initialized database with {len(schemes_data)} schemes (verified Telangana & Central schemes + test demo schemes)."
    )
    db.add(audit)
    db.commit()
    print("Database seeding completed successfully.")
