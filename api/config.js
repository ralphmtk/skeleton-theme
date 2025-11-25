// HubSpot Configuration
export const HUBSPOT_CONFIG = {
    SEQUENCE_IDS: {
        DISTRIBUTOR_NO_PRESENCE: "278558224",
        DISTRIBUTOR_PRESENCE: "278561889",
        RETAILER_NO_PRESENCE: "278553917",
        RETAILER_PRESENCE: "278553939",
        USA_DISTRIBUTOR: "278561288",
        USA_RETAILER: "278561907",
    },
    OWNER_IDS: {
        CHRIS: "174143060",
        PAUL: "844458350",
        KARIM: "174150743",
        YARA: "174124876",
    },
    // Configuration for who "sends" the sequence enrollment (HubSpot User ID & Email)
    // Keys match the OWNER_IDS constant names
    ENROLLERS: {
        CHRIS: { userId: "44723114", email: "hello@zengaz.net" }, // Chris uses Yara's email (hello@zengaz.net is controlled by YARA)
        KARIM: { userId: "44727677", email: "karim.attoue@zengaz.net" },
        PAUL: { userId: "75038571", email: "zalpha.rizk@naarusa.com" }, // Paul uses Zalpha
        YARA: { userId: "44723114", email: "hello@zengaz.net" }, // Yara controls hello@zengaz.net
        DEFAULT: { userId: "44723114", email: "hello@zengaz.net" },
    },
    LIST_IDS: {
        INQUIRIES: "506",
    },
    BASE_PROPERTIES: {
        lead_source: "Ali Express",
        lead_source_details: "Website",
        hs_lead_status: "New Untouched Leads (Inbound/Outbound)",
    },
};

// Country Routing
export const COUNTRY_ROUTING = {
    NAAR: ["Bahrain", "Iraq", "Jordan", "Kuwait", "Lebanon", "Morocco", "Oman", "Qatar", "United Arab Emirates", "Armenia", "Turkey", "Türkiye", "Nigeria", "Dominican Republic", "Mexico", "Bolivia", "Brazil", "Chile", "Colombia", "India"],
    FC_EU: ["Cyprus", "Albania", "Belgium", "Bosnia and Herzegovina", "Bulgaria", "Croatia", "Denmark", "Estonia", "Finland", "France", "Germany", "Greece", "Hungary", "Ireland", "Kosovo", "Latvia", "Lithuania", "Macedonia (FYROM)", "Malta", "Moldova", "Montenegro", "Netherlands", "Norway", "Poland", "Portugal", "Romania", "Serbia", "Slovakia", "Slovenia", "Spain", "Sweden", "Switzerland", "United Kingdom", "Andorra", "Austria", "Belarus", "Czech Republic", "Iceland", "Italy", "Liechtenstein", "Luxembourg", "Monaco", "San Marino", "Ukraine"],
    FC_CN: ["Palestine", "Israel", "China", "Georgia", "Russia", "Thailand", "Macau", "Hong Kong", "Angola", "Botswana", "Democratic Republic of the Congo", "Swaziland", "Lesotho", "Mozambique", "Madagascar", "Malawi", "Mauritius", "Namibia", "South Africa", "Tanzania", "Zambia", "Zimbabwe", "Barbados", "Costa Rica", "Grenada", "Saint Lucia", "Saint Vincent and the Grenadines", "Trinidad and Tobago", "Argentina", "Uruguay", "Australia", "New Zealand", "Fiji", "Kiribati", "Marshall Islands", "Micronesia", "Nauru", "Palau", "Papua New Guinea", "Samoa", "Solomon Islands", "Tuvalu", "Tonga", "Vanuatu"],
    NAAR_USA: ["USA", "Canada", "United States", "US", "Puerto Rico"],
};

// SMTP2GO Configuration
export const SMTP2GO_CONFIG = {
    TEMPLATES: {
        INTERNAL_NOTIFICATION: "5402787",
        CUSTOM_LIGHTERS: "6852192",
        MARKETING_MATERIAL: "5319851",
        CUSTOMER_RESPONSE: "6243502",
        OTHER_RESPONSE: "6243502",
        CUSTOMER_AUTO_RESPONSE: "0142300",
    },
};

// Email Rules
export const EMAIL_CONFIG = {
    CC_RULES: {
        DEFAULT: ["chris.maatouk@naarinternational.com"],
        PAUL: ["chris.maatouk@naarinternational.com", "zalpha.rizk@naarusa.com"],
    },
    BCC_RULES: {
        ALL: ["ralph.maatouk@zengaz.co"],
    },
    ERROR_RECIPIENTS: ["ralph.maatouk@zengaz.co"],
};

// Internal Emails
export const INTERNAL_EMAILS = {
    YAZBECK: "yazbeck.bousamra@naarinternational.com",
    PAUL: "paul-joe@naarusa.com",
    ZALPHA: "zalpha.rizk@naarusa.com",
    KARIM: "karim.attoue@naarinternational.com",
    YARA: "hello@zengaz.net",
    CHRIS: "chris.maatouk@naarinternational.com",
    RALPH: "ralph.maatouk@zengaz.co",
};

// Consumer Response Content (Shared frontend/backend logic if needed, or just backend)
export const CONSUMER_RESPONSES = {
    "How to refill my Zengaz jet lighter?": 'To refill your Zengaz jet lighter, please follow these simple steps:<br /><br />1. Flip your Zengaz lighter upside down.<br />2. Insert the butane gas tip vertically into the refill valve.<br />3. Press down firmly for 5 seconds.<br />4. Allow 2 minutes for the gas to reach room temperature.<br />5. Adjust the flame regulator to the desired level before use.<br />For optimal performance, we recommend using premium butane gas.<br /><br />Still having issues? Contact us at <a href="mailto:hello@zengaz.net">hello@zengaz.net</a> for additional support.',
    "Do you sell replacement parts?": 'We do not offer individual spare parts. However, your Zengaz lighter comes with a one-year warranty! <br /><br />If you believe your Zengaz lighter is experiencing a factory defect (excluding damage from misuse such as excessive dropping, breaking the top off…), kindly fill out this replacement form: <a href="https://forms.gle/vLZKyeYvJ7T5w5Nv9" target="_blank">Replacement Form</a>.',
    "My lighter is not sparking": '<b>As a first step, please try the following, which usually solves the problem:</b><br /><br />1- Empty your lighter by pressing on the inlet valve with a small screwdriver (hold the lighter vertically up while emptying the gas). <br />2- Refill your lighter using high quality butane gas (the lighter should be vertically upside down for gas to flow inside). <br />3- Allow 1min for the gas to rest inside and move the flame regulator from + to - and then back to the middle position. <br />4- Blow a burst of air into the ignition valve (sometimes dust or lint may block the flame). <br />5- Ignite your lighter 3 times quickly, then use it normally. <br /><br />If the above steps haven\'t resolved your issue: <br />If you have a Zengaz lighter kindly fill out this form and our team will process a replacement for you: <a href="https://forms.gle/vLZKyeYvJ7T5w5Nv9" target="_blank">Replacement Form</a>.',
    "Fuel is leaking from my lighter": '<b>As a first step, please try the following, which usually solves the problem:</b><br /><br />1- Empty your lighter by pressing on the inlet valve with a small screwdriver (hold the lighter vertically up while emptying the gas). <br />2- Refill your lighter using high quality butane gas (the lighter should be vertically upside down for gas to flow inside). <br />3- Allow 1min for the gas to rest inside and move the flame regulator from + to - and then back to the middle position. <br />4- Blow a burst of air into the ignition valve (sometimes dust or lint may block the flame). <br />5- Ignite your lighter 3 times quickly, then use it normally. <br /><br />If the above steps haven\'t resolved your issue: <br />If you have a Zengaz lighter kindly fill out this form and our team will process a replacement for you: <a href="https://forms.gle/vLZKyeYvJ7T5w5Nv9" target="_blank">Replacement Form</a>.',
    "Where can I buy Zengaz jet lighters?": 'In order to purchase Zengaz lighters, check out our online shop at <a href="https://www.zengaz.shop" target="_blank">www.zengaz.shop</a>.',
    "I am looking for a specific design": "We're constantly working on new designs, so tracking specific designs can be hard. <br />However, you can always contact us at <a href=\"mailto:hello@zengaz.net\">hello@zengaz.net</a> and we'll do our best to help you out.",
    Review: 'Thank you for your feedback! You can drop us a review on Google, we would greatly appreciate it!<br/><br/><a href="https://g.page/r/CY9KauxLa1S2EAI/review" target="_blank">Google Reviews</a>',
    DEFAULT: "Thank you for contacting us. We have received your message and will get back to you as soon as possible.",
};
