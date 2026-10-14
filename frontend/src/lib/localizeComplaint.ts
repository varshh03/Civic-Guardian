const KNOWN_EN_TO_TA: Record<string, { title: string; desc: string }> = {
  "Large Pothole on Main Road": {
    title: "முக்கிய சாலையில் பெரிய குழி மற்றும் தார் சேதம்",
    desc: "முக்கிய சாலையில் ஆபத்தான குழி ஏற்பட்டுள்ளது. வாகன ஓட்டிகளுக்கு விபத்து அபாயம் உள்ளதால் உடனடி சீரமைப்பு தேவை."
  },
  "Multiple Lights Not Working": {
    title: "சாலையில் பல தெருவிளக்குகள் எரியவில்லை",
    desc: "இந்த பகுதியில் உள்ள பல தெருவிளக்குகள் எரியாமல் இருட்டாக உள்ளது. பொதுமக்கள் மற்றும் பாதசாரிகள் நலன் கருதி புதிய விளக்குகள் பொருத்த வேண்டும்."
  },
  "Faulty Streetlight": {
    title: "பழுதான தெருவிளக்கு மற்றும் மின்கம்ப பழுது",
    desc: "தெருவிளக்கு பழுதடைந்து நீண்ட நாட்களாக எரியாமல் உள்ளது. மின்சார ஊழியர்கள் உடனடியாக சரிசெய்ய வேண்டும்."
  },
  "Urgent Repair Needed for Potholes in City Municipality": {
    title: "மாநகராட்சி பகுதியில் சாலையில் உள்ள ஆபத்தான குழிகளை உடனடியாக சீரமைக்க வேண்டும்",
    desc: "மாநகராட்சி பகுதியில் சாலையில் ஏற்பட்டுள்ள ஆழமான குழிகளை பொது மக்கள் பாதுகாப்பு கருதி போர்க்கால அடிப்படையில் சரிசெய்ய வேண்டும்."
  },
  "Urgent Repair Needed for Potholes in Karur Municipality": {
    title: "மாநகராட்சி பகுதியில் சாலையில் உள்ள ஆபத்தான குழிகளை உடனடியாக சீரமைக்க வேண்டும்",
    desc: "மாநகராட்சி பகுதியில் சாலையில் ஏற்பட்டுள்ள ஆழமான குழிகளை பொது மக்கள் பாதுகாப்பு கருதி போர்க்கால அடிப்படையில் சரிசெய்ய வேண்டும்."
  },
  "Urgent Water Leak Reporting in City Municipality": {
    title: "மாநகராட்சியில் குடிநீர் குழாய் கசிவு பற்றிய அவசர புகார்",
    desc: "குடிநீர் விநியோக பிரதான குழாயில் உடைப்பு ஏற்பட்டு சுத்தமான குடிநீர் சாலையில் வீணாக ஓடுகிறது. உடனடியாக வால்வை மூடி பழுது நீக்க வேண்டும்."
  },
  "Urgent Water Leak Reporting in Karur Municipality": {
    title: "மாநகராட்சியில் குடிநீர் குழாய் கசிவு பற்றிய அவசர புகார்",
    desc: "குடிநீர் விநியோக பிரதான குழாயில் உடைப்பு ஏற்பட்டு சுத்தமான குடிநீர் சாலையில் வீணாக ஓடுகிறது. உடனடியாக வால்வை மூடி பழுது நீக்க வேண்டும்."
  },
  "Streetlight not working near Light House Corner": {
    title: "லைட் ஹவுஸ் கார்னர் அருகில் எரியாத தெருவிளக்கு பழுது",
    desc: "லைட் ஹவுஸ் கார்னர் முக்கிய சந்திப்பில் தெருவிளக்கு எரியாததால் இரவு நேரங்களில் வாகனப் போக்குவரத்து பாதிக்கப்படுகிறது."
  },
  "Urgent Water Leak in City Municipality": {
    title: "மாநகராட்சியில் அவசர குடிநீர் குழாய் உடைப்பு மற்றும் நீர் வீணாதல்",
    desc: "குடிநீர் விநியோக குழாய் உடைந்து பெருமளவு நீர் வீணாகிறது. குடிநீர் வடிகால் வாரிய ஊழியர்கள் உடனடியாக சரிசெய்ய வேண்டும்."
  },
  "Urgent Water Leak in Karur Municipality": {
    title: "மாநகராட்சியில் அவசர குடிநீர் குழாய் உடைப்பு மற்றும் நீர் வீணாதல்",
    desc: "குடிநீர் விநியோக குழாய் உடைந்து பெருமளவு நீர் வீணாகிறது. குடிநீர் வடிகால் வாரிய ஊழியர்கள் உடனடியாக சரிசெய்ய வேண்டும்."
  },
  "Pothole Hazard on Main Road Near Bus Stop": {
    title: "பேருந்து நிறுத்தம் அருகில் உள்ள முக்கிய சாலையில் குழி மற்றும் தார் சேதம்",
    desc: "பேருந்து நிறுத்தம் அருகில் சாலையில் ஏற்பட்டுள்ள பெரிய பள்ளத்தால் பயணிகள் ஏறி இறங்குவதில் சிரமம் ஏற்படுகிறது."
  }
};

const KNOWN_TA_TO_EN: Record<string, { title: string; desc: string }> = {
  "சாலையில் பெரிய குழி": {
    title: "Large Pothole on Road",
    desc: "Deep dangerous pothole detected on road surface. Requires immediate patch work."
  },
  "குடிநீர் குழாய் உடைப்பு": {
    title: "Water Main Pipe Burst",
    desc: "Major drinking water leakage flooding the street. Requires immediate municipal repair."
  },
  "தெருவிளக்கு எரியவில்லை": {
    title: "Streetlight Not Working",
    desc: "Streetlight pole inactive causing darkness and hazard. Electrician crew needed."
  }
};

const hasTamil = (str: string) => /[\u0B80-\u0BFF]/.test(str);

export function getLocalizedComplaintTitle(complaint: any, lang: string): string {
  if (!complaint) return '';
  const currentLang = lang || 'ta';
  const rawTitle = complaint.text_original?.title || complaint.title || '';

  if (currentLang === 'ta') {
    if (complaint.language === 'ta' && hasTamil(rawTitle)) {
      return rawTitle;
    }
    if (KNOWN_EN_TO_TA[rawTitle]) {
      return KNOWN_EN_TO_TA[rawTitle].title;
    }
    for (const [enKey, val] of Object.entries(KNOWN_EN_TO_TA)) {
      if (rawTitle.toLowerCase().includes(enKey.toLowerCase()) || enKey.toLowerCase().includes(rawTitle.toLowerCase())) {
        return val.title;
      }
    }
    if (complaint.issue_type === 'pothole') {
      return complaint.severity === 'High'
        ? 'ஆபத்தான பெரிய சாலைக்குழி மற்றும் சாலை சேதம்'
        : 'சாலையில் குழி மற்றும் தார் சேதம்';
    }
    if (complaint.issue_type === 'water_leak') {
      return complaint.severity === 'High'
        ? 'முக்கிய குடிநீர் குழாய் உடைப்பு மற்றும் நீர் வீணாதல்'
        : 'குடிநீர் குழாய் கசிவு மற்றும் வடிகால் தேக்கம்';
    }
    if (complaint.issue_type === 'streetlight') {
      return 'எரியாத தெருவிளக்கு மற்றும் மின்கம்ப பழுது';
    }
    return rawTitle;
  }

  if (complaint.language === 'en' && complaint.text_en?.title) {
    return complaint.text_en.title;
  }
  if (!hasTamil(rawTitle) && rawTitle) {
    return rawTitle;
  }
  if (KNOWN_TA_TO_EN[rawTitle]) {
    return KNOWN_TA_TO_EN[rawTitle].title;
  }
  for (const [taKey, val] of Object.entries(KNOWN_TA_TO_EN)) {
    if (rawTitle.includes(taKey)) {
      return val.title;
    }
  }
  if (complaint.text_en?.title) {
    return complaint.text_en.title;
  }
  if (complaint.issue_type === 'pothole') {
    return complaint.severity === 'High' ? 'Severe Hazardous Pothole' : 'Road Pothole and Asphalt Damage';
  }
  if (complaint.issue_type === 'water_leak') {
    return complaint.severity === 'High' ? 'Major Water Supply Leak' : 'Water Pipeline Leakage';
  }
  if (complaint.issue_type === 'streetlight') {
    return 'Faulty Streetlight and Pole Outage';
  }
  return rawTitle;
}

export function getLocalizedComplaintDesc(complaint: any, lang: string): string {
  if (!complaint) return '';
  const currentLang = lang || 'ta';
  const rawDesc = complaint.text_original?.description || complaint.description || '';
  const rawTitle = complaint.text_original?.title || complaint.title || '';

  if (currentLang === 'ta') {
    if (complaint.language === 'ta' && hasTamil(rawDesc)) {
      return rawDesc;
    }
    if (KNOWN_EN_TO_TA[rawTitle]) {
      return KNOWN_EN_TO_TA[rawTitle].desc;
    }
    return 'மாநகராட்சி எல்லைக்குட்பட்ட பகுதியில் பொதுமக்களுக்கு இடையூறாக உள்ள இந்த பிரச்சனையை உடனடியாக நேரில் ஆய்வு செய்து நகராட்சி துறை அதிகாரிகள் விரைந்து நடவடிக்கை எடுக்க வேண்டும்.';
  }

  if (complaint.text_en?.description && !hasTamil(complaint.text_en.description)) {
    return complaint.text_en.description;
  }
  if (!hasTamil(rawDesc) && rawDesc) {
    return rawDesc;
  }
  if (KNOWN_TA_TO_EN[rawTitle]) {
    return KNOWN_TA_TO_EN[rawTitle].desc;
  }
  return 'Civic issue detected in City Municipal Corporation. Requires immediate inspection and resolution from the concerned department officers.';
}
