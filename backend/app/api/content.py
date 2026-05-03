"""GET /api/v1/timeline, /glossary, /voter-guide — static election content."""
from __future__ import annotations

from fastapi import APIRouter

from app.models.response import (
    ElectionPhase,
    GlossaryResponse,
    GlossaryTerm,
    TimelineResponse,
    VoterGuideResponse,
    VoterGuideStep,
)

router = APIRouter()

# ── Election Phase Timeline data ──────────────────────────────────────────────
_PHASES: list[ElectionPhase] = [
    ElectionPhase(
        id=1,
        title="Election Announcement",
        title_hi="चुनाव की घोषणा",
        description="The Election Commission announces dates. Model Code of Conduct comes into force immediately.",
        description_hi="निर्वाचन आयोग तारीखें घोषित करता है। आदर्श आचार संहिता तुरंत लागू होती है।",
        icon="📢",
        color="#FF9933",
        steps=["ECI announces schedule", "MCC comes into force", "Government goes into caretaker mode"],
        steps_hi=["ECI अनुसूची घोषित करता है", "आदर्श आचार संहिता लागू", "सरकार देखभाल मोड में"],
    ),
    ElectionPhase(
        id=2,
        title="Voter Roll Preparation",
        title_hi="मतदाता सूची तैयारी",
        description="Electoral rolls are finalised. Last date to register or correct your voter details.",
        description_hi="मतदाता सूची अंतिम रूप दी जाती है। पंजीकरण या सुधार की अंतिम तिथि।",
        icon="📋",
        color="#138808",
        steps=["Check your name at voters.eci.gov.in", "File corrections if needed", "Download e-EPIC"],
        steps_hi=["voters.eci.gov.in पर नाम जांचें", "गलती हो तो सुधार करें", "e-EPIC डाउनलोड करें"],
    ),
    ElectionPhase(
        id=3,
        title="Nomination Filing",
        title_hi="नामांकन दाखिल करना",
        description="Candidates file nominations with Returning Officer. Scrutiny and symbol allotment.",
        description_hi="उम्मीदवार रिटर्निंग ऑफिसर के पास नामांकन दाखिल करते हैं। जांच और चिह्न आवंटन।",
        icon="📝",
        color="#000080",
        steps=["Obtain Form 2B", "File nomination + fee", "Scrutiny by Returning Officer", "Submit affidavit"],
        steps_hi=["फॉर्म 2B लें", "नामांकन + शुल्क दाखिल", "RO द्वारा जांच", "शपथ पत्र जमा करें"],
    ),
    ElectionPhase(
        id=4,
        title="Campaign Period",
        title_hi="प्रचार अवधि",
        description="Parties and candidates campaign. MCC rules enforced. No new govt schemes allowed.",
        description_hi="दल और उम्मीदवार प्रचार करते हैं। MCC नियम लागू। नई सरकारी योजनाएं प्रतिबंधित।",
        icon="🎙️",
        color="#FF6B35",
        steps=["Rallies and public meetings", "cVIGIL app for reporting violations", "Campaign ends 48h before polling"],
        steps_hi=["रैलियां और सार्वजनिक बैठकें", "उल्लंघन रिपोर्ट: cVIGIL ऐप", "मतदान से 48h पहले प्रचार समाप्त"],
    ),
    ElectionPhase(
        id=5,
        title="Polling Day",
        title_hi="मतदान दिवस",
        description="Voters cast their ballots. EVMs used. VVPAT slips verify each vote. 7 AM – 6 PM.",
        description_hi="मतदाता मत डालते हैं। EVM का उपयोग। VVPAT पर्ची प्रत्येक वोट की पुष्टि करती है।",
        icon="🗳️",
        color="#4CAF50",
        steps=["Carry valid ID", "Vote at your designated booth", "Press EVM button", "Verify on VVPAT"],
        steps_hi=["वैध ID लाएं", "अपने निर्धारित बूथ पर वोट करें", "EVM बटन दबाएं", "VVPAT पर सत्यापित करें"],
    ),
    ElectionPhase(
        id=6,
        title="Vote Counting",
        title_hi="मतगणना",
        description="EVMs opened under supervision. Postal ballots counted first. VVPAT cross-verified.",
        description_hi="EVM निगरानी में खोली जाती है। पहले डाक मतपत्र। VVPAT क्रॉस-सत्यापन।",
        icon="🔢",
        color="#9C27B0",
        steps=["Strong rooms opened", "Postal ballot counting", "EVM round-by-round counting", "VVPAT verification"],
        steps_hi=["स्ट्रॉन्ग रूम खोले जाते हैं", "डाक मतपत्र गिनती", "EVM राउंड-दर-राउंड गिनती", "VVPAT सत्यापन"],
    ),
    ElectionPhase(
        id=7,
        title="Result Declaration",
        title_hi="परिणाम घोषणा",
        description="Returning Officers declare winners. Results published on results.eci.gov.in.",
        description_hi="रिटर्निंग ऑफिसर विजेताओं की घोषणा। परिणाम results.eci.gov.in पर।",
        icon="🏆",
        color="#FF9933",
        steps=["Returning Officer declares winner", "Certificate of Election issued", "Results at results.eci.gov.in"],
        steps_hi=["RO विजेता घोषित करते हैं", "चुनाव प्रमाण पत्र जारी", "results.eci.gov.in पर परिणाम"],
    ),
]

# ── Glossary data ─────────────────────────────────────────────────────────────
_GLOSSARY: list[GlossaryTerm] = [
    GlossaryTerm(term="ECI", term_hi="ECI", definition="Election Commission of India — the autonomous constitutional body that administers all elections in India under Article 324.", definition_hi="भारत निर्वाचन आयोग — संविधान के अनुच्छेद 324 के तहत सभी चुनाव संचालित करने वाला स्वायत्त संवैधानिक निकाय।", category="Institutions"),
    GlossaryTerm(term="EVM", term_hi="EVM", definition="Electronic Voting Machine — a standalone device used to record votes since 2004. Not connected to any network.", definition_hi="इलेक्ट्रॉनिक वोटिंग मशीन — 2004 से मतों को रिकॉर्ड करने के लिए उपयोग की जाने वाली डिवाइस। किसी नेटवर्क से जुड़ी नहीं।", category="Technology"),
    GlossaryTerm(term="VVPAT", term_hi="VVPAT", definition="Voter Verifiable Paper Audit Trail — a machine attached to the EVM that prints a paper slip showing your vote for 7 seconds so you can verify it.", definition_hi="मतदाता सत्यापन योग्य पेपर ऑडिट ट्रेल — EVM से जुड़ी मशीन जो 7 सेकंड के लिए पर्ची दिखाती है।", category="Technology"),
    GlossaryTerm(term="EPIC", term_hi="EPIC", definition="Electors Photo Identity Card — commonly called the Voter ID card. Issued by ECI to registered voters.", definition_hi="मतदाता फोटो पहचान पत्र — आमतौर पर वोटर ID कार्ड कहलाता है। ECI द्वारा पंजीकृत मतदाताओं को जारी।", category="Documents"),
    GlossaryTerm(term="Model Code of Conduct (MCC)", term_hi="आदर्श आचार संहिता", definition="ECI guidelines that restrict government actions and political parties from election announcement until results.", definition_hi="ECI के दिशानिर्देश जो चुनाव घोषणा से परिणाम तक सरकार और राजनीतिक दलों को प्रतिबंधित करते हैं।", category="Rules"),
    GlossaryTerm(term="Returning Officer (RO)", term_hi="रिटर्निंग ऑफिसर", definition="A government official appointed by ECI for each constituency to manage nominations, polling, and result declaration.", definition_hi="प्रत्येक निर्वाचन क्षेत्र के लिए ECI द्वारा नियुक्त सरकारी अधिकारी।", category="Officials"),
    GlossaryTerm(term="Booth Level Officer (BLO)", term_hi="बूथ स्तरीय अधिकारी", definition="A government officer responsible for maintaining the electoral roll in a specific polling booth area.", definition_hi="एक विशिष्ट मतदान बूथ क्षेत्र में मतदाता सूची बनाए रखने के लिए जिम्मेदार सरकारी अधिकारी।", category="Officials"),
    GlossaryTerm(term="Lok Sabha", term_hi="लोकसभा", definition="The lower house of India's Parliament with 543 elected seats. A party needs 272+ seats for majority to form government.", definition_hi="भारत की संसद का निचला सदन जिसमें 543 निर्वाचित सीटें हैं। सरकार बनाने के लिए 272+ सीटें चाहिए।", category="Constitution"),
    GlossaryTerm(term="First-Past-The-Post (FPTP)", term_hi="फर्स्ट-पास्ट-द-पोस्ट", definition="India's voting system where each constituency elects one representative and the candidate with the most votes wins.", definition_hi="भारत की मतदान प्रणाली जहां प्रत्येक निर्वाचन क्षेत्र एक प्रतिनिधि चुनता है और सबसे अधिक वोट पाने वाला जीतता है।", category="Voting System"),
    GlossaryTerm(term="Indelible Ink", term_hi="अमिट स्याही", definition="A special ink applied to the left index finger of voters after they vote. It cannot be washed off for several days, preventing double voting.", definition_hi="मतदान के बाद बाएं तर्जनी पर लगाई जाने वाली विशेष स्याही। कई दिनों तक नहीं धुलती, दोहरे मतदान को रोकती है।", category="Voting Process"),
    GlossaryTerm(term="Postal Ballot", term_hi="डाक मतपत्र", definition="Votes cast by mail — used by overseas voters, security forces, and election officials on duty who cannot visit polling stations.", definition_hi="डाक द्वारा डाले गए वोट — विदेशी मतदाताओं, सुरक्षा बलों और ड्यूटी पर अधिकारियों द्वारा उपयोग।", category="Voting Process"),
    GlossaryTerm(term="cVIGIL App", term_hi="cVIGIL ऐप", definition="ECI's mobile app for citizens to report election code violations. Reports are geotagged and responded to within 100 minutes.", definition_hi="ECI का मोबाइल ऐप जिससे नागरिक चुनाव आचार संहिता उल्लंघन की रिपोर्ट कर सकते हैं। 100 मिनट में कार्रवाई।", category="Technology"),
    GlossaryTerm(term="Form 6", term_hi="फॉर्म 6", definition="The official form to apply for new voter registration in India. Available online at voters.eci.gov.in.", definition_hi="भारत में नए मतदाता पंजीकरण के लिए आधिकारिक फॉर्म। voters.eci.gov.in पर ऑनलाइन उपलब्ध।", category="Documents"),
    GlossaryTerm(term="Constituency", term_hi="निर्वाचन क्षेत्र", definition="A geographical area whose voters elect one representative (MP for Lok Sabha, MLA for State Assembly).", definition_hi="एक भौगोलिक क्षेत्र जिसके मतदाता एक प्रतिनिधि (लोकसभा के लिए MP, विधानसभा के लिए MLA) चुनते हैं।", category="Constitution"),
    GlossaryTerm(term="Electoral Roll", term_hi="मतदाता सूची", definition="The official list of all registered voters in a constituency. You must be on this list to vote.", definition_hi="किसी निर्वाचन क्षेत्र के सभी पंजीकृत मतदाताओं की आधिकारिक सूची। मतदान के लिए इस सूची में होना जरूरी है।", category="Documents"),
]

# ── Voter Guide Steps ─────────────────────────────────────────────────────────
_VOTER_GUIDE: list[VoterGuideStep] = [
    VoterGuideStep(step=1, title="Check Eligibility", title_hi="पात्रता जांचें", description="You must be an Indian citizen, 18+ years old on January 1st of the election year, and an ordinary resident of a constituency.", description_hi="आपको भारतीय नागरिक होना चाहिए, चुनावी वर्ष की 1 जनवरी को 18+ वर्ष और एक निर्वाचन क्षेत्र का साधारण निवासी।", tips=["Age is calculated as of 1st January of the year", "You can register even before turning 18 if you turn 18 by January 1"], tips_hi=["आयु वर्ष की 1 जनवरी को गिनी जाती है", "18 से पहले भी पंजीकरण कर सकते हैं अगर 1 जनवरी तक 18 हो जाएं"]),
    VoterGuideStep(step=2, title="Register as a Voter", title_hi="मतदाता के रूप में पंजीकरण", description="Fill Form 6 online at voters.eci.gov.in with your name, address, date of birth, and upload required documents.", description_hi="voters.eci.gov.in पर फॉर्म 6 ऑनलाइन भरें। नाम, पता, जन्म तिथि दर्ज करें और दस्तावेज अपलोड करें।", action_url="https://voters.eci.gov.in", tips=["Keep Aadhaar + a recent photograph ready", "You can also register offline at your local BLO office"], tips_hi=["आधार और हालिया फोटो तैयार रखें", "स्थानीय BLO कार्यालय में ऑफलाइन भी पंजीकरण कर सकते हैं"]),
    VoterGuideStep(step=3, title="Download Your Voter ID", title_hi="वोटर ID डाउनलोड करें", description="After approval (2-4 weeks), download your e-EPIC (digital Voter ID) from the voter portal. It's legally valid.", description_hi="स्वीकृति के बाद (2-4 सप्ताह), वोटर पोर्टल से e-EPIC (डिजिटल वोटर ID) डाउनलोड करें। यह कानूनी रूप से वैध है।", action_url="https://voters.eci.gov.in", tips=["e-EPIC is accepted at all polling booths", "Physical card is mailed to your registered address"], tips_hi=["e-EPIC सभी मतदान बूथों पर स्वीकार्य है", "भौतिक कार्ड पंजीकृत पते पर डाक द्वारा भेजा जाता है"]),
    VoterGuideStep(step=4, title="Find Your Polling Booth", title_hi="मतदान केंद्र खोजें", description="Check your voter slip for your designated polling booth address. Booths are always within 2 km of your home.", description_hi="अपने निर्धारित मतदान केंद्र के पते के लिए मतदाता पर्ची देखें। बूथ हमेशा आपके घर से 2 किमी के भीतर होते हैं।", action_url="https://voters.eci.gov.in", tips=["Your booth is printed on your voter slip", "Search by name at voters.eci.gov.in to find booth"], tips_hi=["आपका बूथ मतदाता पर्ची पर छपा है", "voters.eci.gov.in पर नाम से खोजें"]),
    VoterGuideStep(step=5, title="Vote on Polling Day", title_hi="मतदान दिवस पर वोट करें", description="Carry any valid photo ID, reach your booth between 7 AM–6 PM, press the EVM button, and verify on VVPAT.", description_hi="कोई भी वैध फोटो ID लाएं, सुबह 7 – शाम 6 बजे के बीच बूथ पर पहुंचें, EVM बटन दबाएं, VVPAT पर सत्यापित करें।", tips=["Carry Voter ID, Aadhaar, PAN, Passport or Driving Licence", "Senior citizens and persons with disability get priority queuing", "No mobile phones inside the booth"], tips_hi=["वोटर ID, आधार, पैन, पासपोर्ट या ड्राइविंग लाइसेंस लाएं", "बुजुर्ग और दिव्यांग को प्राथमिकता", "बूथ के अंदर मोबाइल नहीं"]),
]


@router.get("/timeline", response_model=TimelineResponse)
async def get_timeline() -> TimelineResponse:
    """Return ordered election phase timeline."""
    return TimelineResponse(phases=_PHASES)


@router.get("/glossary", response_model=GlossaryResponse)
async def get_glossary() -> GlossaryResponse:
    """Return searchable election glossary."""
    return GlossaryResponse(terms=_GLOSSARY)


@router.get("/voter-guide", response_model=VoterGuideResponse)
async def get_voter_guide() -> VoterGuideResponse:
    """Return the first-time voter step-by-step guide."""
    return VoterGuideResponse(steps=_VOTER_GUIDE)
