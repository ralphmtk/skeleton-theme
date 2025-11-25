<?php


    // Owner and Sequence Configuration
    global $OWNER_CONFIG, $SITE_CONFIG;
    $OWNER_CONFIG = [
        '174143060' => ['name' => 'karim', 'userId' => '44723114', 'email' => 'hello@zengaz.net'],
        '174150743' => ['name' => 'karim', 'userId' => '44727677', 'email' => 'karim.attoue@zengaz.net'],
        '844458350' => ['name' => 'zalpha', 'userId' => '75038571', 'email' => 'zalpha.rizk@naarusa.com	'],
        'DEFAULT' => ['name' => 'karim', 'userId' => '44723114', 'email' => 'hello@zengaz.net'],
    ];

    // Single site Configuration
    $SITE_CONFIG = [
        'name' => 'zengaz.com',
        'internal' => [
          
            'cc_rules' => [
                'default' => ['chris.maatouk@naarinternational.com'],
                'yara' => ['chris.maatouk@naarinternational.com', 'charbel.kachouh@zengaz.net']
            ]
        ],
        'public' => [
            'country_routing' => [
                'NAAR' => ['Bahrain', 'Iraq', 'Jordan', 'Kuwait', 'Lebanon', 'Morocco', 'Oman', 'Qatar', 'United Arab Emirates', 'Armenia', 'Turkey', "Türkiye", 'Nigeria', 'Dominican Republic', 'Mexico', 'Bolivia', 'Brazil', 'Chile', 'Colombia', 'India'],
                'FC_EU' => ['Cyprus', 'Albania', 'Belgium', 'Bosnia and Herzegovina', 'Bulgaria', 'Croatia', 'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary', 'Ireland', 'Kosovo', 'Latvia', 'Lithuania', 'Macedonia', 'Malta', 'Moldova', 'Montenegro', 'Netherlands', 'Norway', 'Poland', 'Portugal', 'Romania', 'Serbia', 'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Switzerland', 'United Kingdom', 'Andorra', 'Austria', 'Belarus', 'Czech Republic', 'Iceland', 'Italy', 'Liechtenstein', 'Luxembourg', 'Monaco', 'San Marino', 'Ukraine'],
                'FC_CN' => ['Palestine', 'Israel', 'China', 'Georgia', 'Russia', 'Thailand', 'Macao', 'Hong Kong', 'Angola', 'Botswana', 'DRC', 'Eswatini', 'Lesotho', 'Mozambique', 'Madagascar', 'Malawi', 'Mauritius', 'Namibia', 'South Africa', 'Tanzania', 'Zambia', 'Zimbabwe', 'Barbados', 'Costa Rica', 'Grenada', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Trinidad and Tobago', 'Argentina', 'Uruguay', 'Australia', 'New Zealand', 'Fiji', 'Kiribati', 'Marshall Islands', 'Micronesia', 'Nauru', 'Palau', 'Papua New Guinea', 'Samoa', 'Solomon Islands', 'Tuvalu', 'Tonga', 'Vanuatu'],
                'NAAR_USA' => ['USA', 'Canada', 'United States', 'US', 'Puerto Rico']
            ],
            'base_properties' => [
                'lead_source' => 'Ali Express',
                'lead_source_details' => 'Website',
                'hs_lead_status' => 'New Untouched Leads (Inbound/Outbound)'
            ]
        ]
    ];
}

function zengaz_handle_request($input)
{
    global $SITE_CONFIG, $OWNER_CONFIG;

    $action = $input['action'];
    $response = [];

    switch ($action) {
        case 'get_config':
            $response = [
                'config' => [
                    'country_routing' => $SITE_CONFIG['public']['country_routing'],
                    'base_properties' => $SITE_CONFIG['public']['base_properties']
                ]
            ];
            break;

        case 'add_contact':
            try {
                if (!isset($input['email'])) {
                    throw new Exception('Missing required email parameter');
                }

                $properties = zengaz_getPropertiesForUserType($input, $SITE_CONFIG);
                $contactId = zengaz_updateContactAndAddToList($input['email'], $properties);

                if (!is_numeric($contactId)) {
                    throw new Exception("Failed to add or update contact. Reason: " . $contactId);
                }
                error_log("Successfully processed contact with ID: {$contactId}");
				
				$listId = $SITE_CONFIG['internal']['hubspot_lists']['MAIN_LIST'] ?? null;
                if ($listId) {
                    $addedToList = zengaz_addContactToList($contactId, $listId);
                    if (!$addedToList) {
                        error_log("CRITICAL: Failed to add contact {$contactId} to HubSpot list {$listId}.");
                    }
                }

                $ownerId = zengaz_getHubspotOwnerId($input, $SITE_CONFIG);
                if ($ownerId === $SITE_CONFIG['internal']['hubspot_owners']['PAUL']) {
                    if (!empty($input['companyName'])) {
                        $dealSuccess = zengaz_createHubspotDeal($contactId, $input['companyName'], $ownerId);
                        if (!$dealSuccess) {
                            error_log("CRITICAL: Failed to create HubSpot deal for contact {$contactId}.");
                        }
                    } else {
                        error_log("Skipping deal creation for contact {$contactId}: Company Name is missing.");
                    }
                }

                $userType = $input['userType'] ?? '';
                $subject = $input['subject'] ?? '';
                $isBusinessUser = in_array($userType, ['Distributor/Wholesaler', 'Shop/Retailer']);

                if ($isBusinessUser && $subject === 'Purchasing request') {
                    $sequenceId = zengaz_getSequenceIdForContact($userType, $input['country'] ?? '', $SITE_CONFIG);
                    if ($sequenceId) {
                        $enrollingUser = $OWNER_CONFIG[$ownerId] ?? $OWNER_CONFIG['DEFAULT'];
                        error_log("Attempting to enroll contact {$contactId} in sequence {$sequenceId} with ownerId {$ownerId} by user {$enrollingUser['email']}");

                        $enrollmentSuccess = zengaz_enrollInHubspotSequence($contactId, $sequenceId, $enrollingUser);
                        if (!$enrollmentSuccess) {
                            error_log("CRITICAL: HubSpot sequence enrollment failed for contact {$contactId}.");
                        }
                    } else {
                        error_log("Skipping sequence enrollment for {$contactId}: No sequence ID found for userType '{$userType}' and country '{$input['country']}'.");
                    }
                    error_log("Skipping customer-facing email for purchasing request from {$input['email']}. Sequence enrollment handles follow-up.");
                } else {
                    $templateId = null;
                    $emailVariables = $input;

                    if ($isBusinessUser && $subject === 'Customized lighters request') {
                        $templateId = $SITE_CONFIG['internal']['email_templates']['CUSTOM_LIGHTERS'];
                    } else if ($isBusinessUser && $subject === 'Marketing material request') {
                        $templateId = $SITE_CONFIG['internal']['email_templates']['MARKETING_MATERIAL'];
                    } else if ($userType === 'Consumer') {
                        $templateId = $SITE_CONFIG['internal']['email_templates']['CUSTOMER_AUTO_RESPONSE'];
                        $emailVariables['content'] = zengaz_getConsumerResponseContent($subject);
                    } else if ($userType === 'Other') {
                        $templateId = $SITE_CONFIG['internal']['email_templates']['CUSTOMER_RESPONSE'];
                    }

                    if (!$templateId && $isBusinessUser) {
                        $templateId = $SITE_CONFIG['internal']['email_templates']['CUSTOMER_RESPONSE'];
                    }

                    if ($templateId) {
                        if ($userType === 'Other') {
                            $input['message'] = "Type: " . ($input['otherType'] ?? 'Not specified') . "\n\n" . "Message: " . ($input['message'] ?? '');
                            $emailVariables['message'] = $input['message'];
                        }
                        error_log("Attempting to send customer email with template {$templateId} to {$input['email']}");

                        $emailSuccess = zengaz_sendEmail(
                            $templateId,
                            $input['email'],
                            [],
                            $emailVariables
                        );

                        if (!$emailSuccess) {
                            error_log("Failed to send confirmation email to user: {$input['email']}");
                        }
                    } else {
                        error_log("No customer-facing email template found for this request from {$input['email']}.");
                    }
                }

                $owner = zengaz_getRecipientByType($input, $SITE_CONFIG);
                if ($owner && !empty($owner['email'])) {
                    $ccEmails = isset($SITE_CONFIG['internal']['cc_rules'][$owner['email']])
                        ? $SITE_CONFIG['internal']['cc_rules'][$owner['email']]
                        : $SITE_CONFIG['internal']['cc_rules']['default'];

                    $emailVariables = [
                        'userType' => $input['userType'] ?? '',
                        'firstname' => $input['firstName'] ?? '',
                        'lastname' => $input['lastName'] ?? '',
                        'companyname' => $input['companyName'] ?? '',
                        'companywebsite' => $input['companyWebsite'] ?? '',
                        'country' => $input['country'] ?? '',
                        'phone' => $input['phone'] ?? '',
                        'email' => $input['email'] ?? '',
                        'hearAboutUs' => $input['hearAboutUs'] ?? '',
                        'howCanWeHelpYou' => $input['subject'] ?? '',
                        'numberOfLocations' => $input['shopLocations'] ?? '',
                        'subject' => $input['subject'] ?? '',
                        'message' => $input['message'] ?? ($input['subject'] ?? ''),
                        'shopTypes' => $input['businessModel'] ?? '',
                        'industry' => $input['industry'] ?? '',
                        'otherUserType' => $input['otherType'] ?? '',
                        'content' => $input['content'] ?? '',
                        'recipientName' => $owner['name']
                    ];
                    error_log("Attempting to send internal notification to {$owner['email']}.");

                    $internalSuccess = zengaz_sendEmail(
                        $SITE_CONFIG['internal']['email_templates']['INTERNAL_NOTIFICATION'],
                        $owner['email'],
                        $ccEmails,
                        $emailVariables
                    );

                    if (!$internalSuccess) {
                        error_log("Failed to send internal notification email to: {$owner['email']}");
                    }
                } else {
                    error_log("Could not determine an internal recipient for the notification email.");
                }

                $response = ['success' => true, 'message' => 'Contact processed successfully.'];

                // If the user is a consumer, add the specific response content to the payload
                // so the frontend can display it.
                if (($input['userType'] ?? '') === 'Consumer') {
                    $response['consumerResponse'] = zengaz_getConsumerResponseContent($input['subject'] ?? '');
                }
            } catch (Exception $e) {
                $error_message = sprintf(
                    "Error in 'add_contact' action: %s in %s on line %d. Input: %s",
                    $e->getMessage(),
                    $e->getFile(),
                    $e->getLine(),
                    json_encode($input)
                );
                error_log($error_message);
                zengaz_sendErrorEmail("Zengaz Form Exception", $error_message . "\n\nStack Trace:\n" . $e->getTraceAsString());
                throw $e; // Re-throw to be caught by the main handler
            }
            break;

        default:
            throw new Exception('Invalid action');
    }

    return $response;
}

function zengaz_setupCurl($url)
{
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    if (file_exists(CACERT_PATH)) {
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        curl_setopt($ch, CURLOPT_CAINFO, CACERT_PATH);
    } else {
        error_log("SECURITY WARNING: CA Certificate bundle not found at " . CACERT_PATH . ". Disabling SSL peer verification. THIS IS NOT SAFE FOR PRODUCTION.");
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
    }

    return $ch;
}

function zengaz_sendEmail($templateId, $toEmail, $ccEmail = [], $variables = [])
{
    $emailData = [
        'api_key' => SMTP2GO_API_KEY,
        'to' => [$toEmail],
        'cc' => is_array($ccEmail) ? $ccEmail : array_map('trim', explode(',', $ccEmail)),
        'sender' => 'Zengaz <hello@zengaz.net>',
        'template_id' => $templateId,
        'template_data' => $variables
    ];

    $ch = zengaz_setupCurl('https://api.smtp2go.com/v3/email/send');
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($emailData));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode !== 200) {
        error_log("SMTP2GO Error: " . $response);
        return false;
    }

    $result = json_decode($response, true);
    return isset($result['data']) && $result['data']['succeeded'] > 0;
}

function zengaz_updateContactAndAddToList($email, $properties)
{
    try {
        $ch = zengaz_setupCurl(HUBSPOT_API_BASE_URL . "/crm/v3/objects/contacts/search");
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
            'filterGroups' => [
                ['filters' => [['propertyName' => 'email', 'operator' => 'EQ', 'value' => $email]]]
            ]
        ]));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Authorization: Bearer ' . HUBSPOT_API_KEY
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 200) {
            error_log("HubSpot Search Error: " . $response);
            return "HubSpot Search API returned HTTP " . $httpCode . ". Response: " . $response;
        }

        $result = json_decode($response, true);
        if (!$result) {
            error_log("Failed to decode HubSpot search response");
            return "Failed to decode HubSpot search response.";
        }

        if (!empty($result['results'])) {
            $contactId = $result['results'][0]['id'];
            $ch = zengaz_setupCurl(HUBSPOT_API_BASE_URL . "/crm/v3/objects/contacts/{$contactId}");
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PATCH');
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['properties' => $properties]));
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Content-Type: application/json',
                'Authorization: Bearer ' . HUBSPOT_API_KEY
            ]);

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($httpCode >= 200 && $httpCode < 300) {
                return $contactId;
            }

            error_log("HubSpot Update Error: " . $response);
            return "HubSpot Update API returned HTTP " . $httpCode . ". Response: " . $response;
        } else {
            $ch = zengaz_setupCurl(HUBSPOT_API_BASE_URL . "/crm/v3/objects/contacts");
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['properties' => $properties]));
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Content-Type: application/json',
                'Authorization: Bearer ' . HUBSPOT_API_KEY
            ]);

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($httpCode >= 200 && $httpCode < 300) {
                $newContact = json_decode($response, true);
                error_log("Successfully created new contact in HubSpot with ID: " . ($newContact['id'] ?? 'N/A'));
                return $newContact['id'] ?? true;
            }

            error_log("HubSpot Create Error: " . $response);
            return "HubSpot Create API returned HTTP " . $httpCode . ". Response: " . $response;
        }
    } catch (Exception $e) {
        error_log("HubSpot API Error: " . $e->getMessage());
        return "A server exception occurred: " . $e->getMessage();
    }
}

function zengaz_getPropertiesForUserType($data, $config)
{
    $message = '';
    if (isset($data['message'])) {
        $message = $data['message'];
    } else if (isset($data['subject'])) {
        $message = $data['subject'];
    }

    $commonProperties = [
        'customer_type___mb' => $data['userType'] ?? '',
        'firstname' => $data['firstName'] ?? '',
        'lastname' => $data['lastName'] ?? '',
        'countries' => $data['country'] ?? '',
        'phone' => $data['phone'] ?? '',
        'email' => $data['email'] ?? '',
        'how_did_you_hear_about_us____mb' => $data['hearAboutUs'] ?? '',
        'message' => $message
    ];

    $ownerId = zengaz_getHubspotOwnerId($data, $config);
    if ($ownerId) {
        $commonProperties['hubspot_owner_id'] = $ownerId;
    }

    $typeProperties = [];
    switch ($data['userType'] ?? '') {
        case 'Consumer':
            $typeProperties = [
                'consumer_request_type___mb' => $data['subject'] ?? ''
            ];
            break;

        case 'Shop/Retailer':
            $typeProperties = [
                'company' => $data['companyName'] ?? '',
                'retail_locations' => $data['shopLocations'] ?? '',
                'website' => $data['companyWebsite'] ?? '',
                'consumer___request_type___mb' => $data['subject'] ?? '',
                'business_model' => $data['businessModel'] ?? '',
                'industry___mb' => $data['industry'] ?? ''
            ];
            break;

        case 'Distributor/Wholesaler':
            $typeProperties = [
                'company' => $data['companyName'] ?? '',
                'website' => $data['companyWebsite'] ?? '',
                'consumer___request_type___mb' => $data['subject'] ?? '',
                'business_model' => $data['businessModel'] ?? '',
                'industry___mb' => $data['industry'] ?? ''
            ];
            break;

        case 'Other':
            $typeProperties = [
                'company' => $data['companyName'] ?? '',
                'website' => $data['companyWebsite'] ?? '',
                'customer_type___other_type' => $data['otherType'] ?? ''
            ];
            break;
    }

    return array_merge(
        $commonProperties,
        $typeProperties,
        $config['public']['base_properties']
    );
}

function zengaz_getHubspotOwnerId($data, $config)
{
    $userType = $data['userType'] ?? '';
    $country = $data['country'] ?? '';
    $subject = $data['subject'] ?? '';

    if ($subject === 'Marketing material request') {
        return $config['internal']['hubspot_owners']['YARA'];
    }

    $isUsa = in_array($country, $config['public']['country_routing']['NAAR_USA']);

    if ($userType === 'Consumer' && $isUsa) {
        return $config['internal']['hubspot_owners']['YARA'];
    }

    $isNaarOrEu = in_array($country, $config['public']['country_routing']['NAAR']) || in_array($country, $config['public']['country_routing']['FC_EU']) || in_array($country, $config['public']['country_routing']['FC_CN']);

    if ($userType === 'Distributor/Wholesaler' || $userType === 'Shop/Retailer') {
        if ($isUsa) {
            return $config['internal']['hubspot_owners']['PAUL'];
        }
        if ($isNaarOrEu) {
            return $config['internal']['hubspot_owners']['CHRIS'];
        }
        return $config['internal']['hubspot_owners']['KARIM'];
    }

    if ($isUsa) {
        return $config['internal']['hubspot_owners']['PAUL'];
    }
    return $config['internal']['hubspot_owners']['YARA'];
}

function zengaz_getRecipientByType($data, $config)
{
    $userType = $data['userType'] ?? '';
    $country = $data['country'] ?? '';
    $subject = $data['subject'] ?? '';

    if ($subject === 'Marketing material request') {
        return ['id' => $config['internal']['hubspot_owners']['YARA'], 'name' => 'Yara', 'email' => $config['internal']['recipients']['yara']];
    }

    $isUsa = in_array($country, $config['public']['country_routing']['NAAR_USA']);

    if ($userType === 'Consumer' && $isUsa) {
        return ['id' => $config['internal']['hubspot_owners']['YARA'], 'name' => 'Yara', 'email' => $config['internal']['recipients']['yara']];
    }

    if ($userType === 'Other' || $userType === 'Consumer') {
        return [
            'id' => $config['internal']['hubspot_owners']['YARA'],
            'name' => 'Yara',
            'email' => $config['internal']['recipients']['yara']
        ];
    }

    if (
        in_array($country, $config['public']['country_routing']['NAAR']) ||
        in_array($country, $config['public']['country_routing']['FC_EU']) ||
        in_array($country, $config['public']['country_routing']['FC_CN'])
    ) {
        return [
            'id' => $config['internal']['hubspot_owners']['CHRIS'],
            'name' => 'Yazbeck',
            'email' => $config['internal']['recipients']['yazbeck']
        ];
    }

    if ($isUsa) {
        return [
            'id' => $config['internal']['hubspot_owners']['PAUL'],
            'name' => 'Paul',
            'email' => $config['internal']['recipients']['paul']
        ];
    }

    return [
        'id' => $config['internal']['hubspot_owners']['KARIM'],
        'name' => 'Karim',
        'email' => $config['internal']['recipients']['karim']
    ];
}

function zengaz_getConsumerResponseContent($subject)
{
    switch ($subject) {
        case 'How to refill my Zengaz jet lighter?':
            return 'To refill your Zengaz jet lighter, please follow these simple steps:<br /><br />1. Flip your Zengaz lighter upside down.<br />2. Insert the butane gas tip vertically into the refill valve.<br />3. Press down firmly for 5 seconds.<br />4. Allow 2 minutes for the gas to reach room temperature.<br />5. Adjust the flame regulator to the desired level before use.<br />For optimal performance, we recommend using premium butane gas.<br /><br />Still having issues? Contact us at <a href="mailto:hello@zengaz.net">hello@zengaz.net</a> for additional support.';
        case 'Do you sell replacement parts?':
            return 'We do not offer individual spare parts. However, your Zengaz lighter comes with a one-year warranty! <br /><br />If you believe your Zengaz lighter is experiencing a factory defect (excluding damage from misuse such as excessive dropping, breaking the top off…), kindly fill out this replacement form: <a href="https://forms.gle/vLZKyeYvJ7T5w5Nv9" target="_blank">Replacement Form</a>.';
        case 'My lighter is not sparking':
        case 'Fuel is leaking from my lighter':
            return '<b>As a first step, please try the following, which usually solves the problem:</b><br /><br />1- Empty your lighter by pressing on the inlet valve with a small screwdriver (hold the lighter vertically up while emptying the gas). <br />2- Refill your lighter using high quality butane gas (the lighter should be vertically upside down for gas to flow inside). <br />3- Allow 1min for the gas to rest inside and move the flame regulator from + to - and then back to the middle position. <br />4- Blow a burst of air into the ignition valve (sometimes dust or lint may block the flame). <br />5- Ignite your lighter 3 times quickly, then use it normally. <br /><br />If the above steps haven\'t resolved your issue: <br />If you have a Zengaz lighter kindly fill out this form and our team will process a replacement for you: <a href="https://forms.gle/vLZKyeYvJ7T5w5Nv9" target="_blank">Replacement Form</a>.';
        case 'Where can I buy Zengaz jet lighters?':
            return 'In order to purchase Zengaz lighters, check out our online shop at <a href="https://www.zengaz.shop" target="_blank">www.zengaz.shop</a>.';
        case 'I am looking for a specific design':
            return 'We\'re constantly working on new designs, so tracking specific designs can be hard. <br />However, you can always contact us at <a href="mailto:hello@zengaz.net">hello@zengaz.net</a> and we\'ll do our best to help you out.';
        case 'Review':
            return 'Thank you for your feedback! You can drop us a review on Google, we would greatly appreciate it!<br/><br/><a href="https://g.page/r/CY9KauxLa1S2EAI/review" target="_blank">Google Reviews</a>';
        default:
            return 'Thank you for contacting us. We have received your message and will get back to you as soon as possible.';
    }
}

function zengaz_isCountryInAnyList($country, $config)
{
    foreach ($config['public']['country_routing'] as $region => $countries) {
        if (in_array($country, $countries)) {
            return true;
        }
    }
    return false;
}

function zengaz_getSequenceIdForContact($userType, $country, $config)
{
    if ($userType === 'Consumer' || $userType === 'Other') {
        return null;
    }

    $isUsa = in_array($country, $config['public']['country_routing']['NAAR_USA']);
    $presence = zengaz_isCountryInAnyList($country, $config);

    if ($userType === 'Distributor/Wholesaler') {
        if ($isUsa) return SEQ_USA_DISTRO;
        return $presence ? SEQ_DISTRO_PRESENCE : SEQ_DISTRO_NO_PRESENCE;
    }

    if ($userType === 'Shop/Retailer') {
        if ($isUsa) return SEQ_USA_RETAILER;
        return $presence ? SEQ_RETAILER_PRESENCE : SEQ_RETAILER_NO_PRESENCE;
    }

    return null;
}

function zengaz_enrollInHubspotSequence($contactId, $sequenceId, $enrollingUser)
{
    if (empty($enrollingUser['userId']) || empty($enrollingUser['email'])) {
        error_log("Enrollment failed: Missing userId or email for the enrolling user.");
        return false;
    }

    $url = HUBSPOT_API_BASE_URL . "/automation/v4/sequences/enrollments?userId=" . urlencode($enrollingUser['userId']);
    $ch = zengaz_setupCurl($url);

    $data = [
        'contactId' => $contactId,
        'sequenceId' => $sequenceId,
        'senderEmail' => $enrollingUser['email'],
    ];

    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . HUBSPOT_API_KEY,
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);

    if ($httpCode >= 200 && $httpCode < 300) {
        error_log("Successfully enrolled contact {$contactId} in sequence {$sequenceId} by user {$enrollingUser['email']}.");
        return true;
    } else {
        error_log("Failed to enroll contact in HubSpot sequence. HTTP Status: {$httpCode}. Error: {$error}. Response: " . $response);
        return false;
    }
}

function zengaz_createHubspotDeal($contactId, $companyName, $ownerId)
{
    $url = HUBSPOT_API_BASE_URL . "/crm/v3/objects/deals";
    $ch = zengaz_setupCurl($url);

    $dealProperties = [
        'dealname' => $companyName,
        'hubspot_owner_id' => $ownerId,
        'dealtype' => 'newbusiness',
        'dealstage' => 'appointmentscheduled',
    ];

    $associations = [
        [
            'to' => ['id' => $contactId],
            'types' => [
                [
                    'associationCategory' => 'HUBSPOT_DEFINED',
                    'associationTypeId' => 3
                ]
            ]
        ]
    ];

    $data = [
        'properties' => $dealProperties,
        'associations' => $associations
    ];

    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . HUBSPOT_API_KEY,
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);

    if ($httpCode >= 200 && $httpCode < 300) {
        $deal = json_decode($response, true);
        error_log("Successfully created deal with ID " . ($deal['id'] ?? 'N/A') . " for contact " . $contactId . " and assigned to owner " . $ownerId);
        return true;
    } else {
        error_log("Failed to create HubSpot deal. HTTP Status: {$httpCode}. Error: {$error}. Response: " . $response);
        return false;
    }
}

function zengaz_addContactToList($contactId, $listId)
{
    $url = HUBSPOT_API_BASE_URL . "/contacts/v1/lists/{$listId}/add";
    $ch = zengaz_setupCurl($url);

    $data = [
        'vids' => [(int)$contactId]
    ];

    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . HUBSPOT_API_KEY
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);

    if ($httpCode >= 200 && $httpCode < 300) {
        error_log("Successfully added contact {$contactId} to list {$listId}.");
        return true;
    } else {
        error_log("Failed to add contact {$contactId} to list {$listId}. HTTP Status: {$httpCode}. Error: {$error}. Response: " . $response);
        return false;
    }
}

function zengaz_sendErrorEmail($subject, $body)
{
    global $SITE_CONFIG;

    $recipients = $SITE_CONFIG['internal']['error_logs'] ?? [];
    if (empty($recipients)) {
        error_log("Error email not sent: No recipients configured in SITE_CONFIG['internal']['error_logs']");
        return false;
    }

    $emailData = [
        'api_key' => SMTP2GO_API_KEY,
        'to' => $recipients,
        'sender' => 'zengaz.com Errors <hello@zengaz.net>',
        'subject' => $subject,
        'html_body' => '<pre style="font-family: monospace; white-space: pre-wrap; word-wrap: break-word;">' . htmlspecialchars($body) . '</pre>',
        'text_body' => $body
    ];

    $ch = zengaz_setupCurl('https://api.smtp2go.com/v3/email/send');
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($emailData));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode !== 200) {
        file_put_contents(ZENGAZ_FORM_PLUGIN_PATH . 'smtp_error.log', date('Y-m-d H:i:s') . " - SMTP2GO Error: " . $response . "\n", FILE_APPEND);
        return false;
    }

    $result = json_decode($response, true);
    return isset($result['data']) && $result['data']['succeeded'] > 0;
}
