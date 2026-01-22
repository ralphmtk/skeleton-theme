import { Client } from "@hubspot/api-client";
import axios from "axios";
import { HUBSPOT_CONFIG, SMTP2GO_CONFIG, INTERNAL_EMAILS, COUNTRY_ROUTING, EMAIL_CONFIG, CONSUMER_RESPONSES } from "./config.js";

const hubspotClient = new Client({ accessToken: process.env.HUBSPOT_ACCESS_TOKEN });

export default async function handler(req, res) {
    const origin = req.headers.origin || "*";
    res.setHeader("Access-Control-Allow-Credentials", true);
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version");

    if (req.method === "OPTIONS") {
        res.status(200).end();
        return;
    }

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const data = req.body;

        // DEBUG: Log ALL incoming form data
        console.log("========== INCOMING FORM DATA ==========");
        console.log("Full request body:", JSON.stringify(data, null, 2));
        console.log("=========================================");

        // Normalize Data
        const userType = data.type || "";
        const country = data.country || "";
        const normalizedCountry = country.toLowerCase();
        const isBusinessUser = userType === "distributor" || userType === "retailer";
        const isConsumer = userType === "consumer";
        const isOther = userType === "other";
        const subject = isConsumer ? data.help : isOther ? "Other Request" : data.help; // Use 'help' as subject for consumer, or default for others if needed

        console.log("Parsed form data:", {
            email: data.email,
            type: userType,
            country,
            firstName: data.firstName,
            lastName: data.lastName,
            help: data.help,
            isBusinessUser,
            isConsumer,
            isOther,
        });

        // 1. Determine HubSpot Owner & Internal Recipient
        let ownerId = HUBSPOT_CONFIG.OWNER_IDS.KARIM;
        let internalRecipientEmail = INTERNAL_EMAILS.KARIM;

        // Helper to check routing (case-insensitive matching, but preserve original country value for HubSpot)
        const checkRouting = (list) => list.some((c) => c.toLowerCase() === normalizedCountry);
        const isUSA = checkRouting(COUNTRY_ROUTING.NAAR_USA);
        const isNaarEuCn = checkRouting(COUNTRY_ROUTING.NAAR) || checkRouting(COUNTRY_ROUTING.FC_EU) || checkRouting(COUNTRY_ROUTING.FC_CN);

        // Special Case: Marketing Material Request -> Yara
        if (data.help === "Marketing material request") {
            ownerId = HUBSPOT_CONFIG.OWNER_IDS.YARA;
            internalRecipientEmail = INTERNAL_EMAILS.YARA;
        }
        // Consumer / Other Logic - Always Yara regardless of location
        else if (isConsumer || isOther) {
            ownerId = HUBSPOT_CONFIG.OWNER_IDS.YARA;
            internalRecipientEmail = INTERNAL_EMAILS.YARA;
        }
        // Business User Logic
        else if (isBusinessUser) {
            if (isUSA) {
                ownerId = HUBSPOT_CONFIG.OWNER_IDS.PAUL;
                internalRecipientEmail = INTERNAL_EMAILS.PAUL;
            } else if (isNaarEuCn) {
                ownerId = HUBSPOT_CONFIG.OWNER_IDS.CHRIS;
                internalRecipientEmail = INTERNAL_EMAILS.YAZBECK; // Chris owns it, Yazbeck gets email
            } else {
                ownerId = HUBSPOT_CONFIG.OWNER_IDS.KARIM;
                internalRecipientEmail = INTERNAL_EMAILS.KARIM;
            }
        }

        // 2. Prepare HubSpot Properties
        const properties = {
            ...HUBSPOT_CONFIG.BASE_PROPERTIES,
            email: data.email,
            firstname: data.firstName,
            lastname: data.lastName,
            phone: data.phone,
            country: data.country, // Using exact HubSpot country values from dropdown
            how_did_you_hear_about_us____mb: data.hearAbout,
            lifecyclestage: "lead",
            customer_type___mb: mapUserTypeToLabel(userType), // Updated key based on PHP
            message: data.message || data.otherDetails || data.help, // Fallback for message
        };

        if (ownerId) properties.hubspot_owner_id = ownerId;

        // Type Specific Properties
        if (isBusinessUser) {
            properties.company = data.companyName;
            properties.website = data.companyWebsite;
            properties.consumer___request_type___mb = data.help; // Subject mapping
            properties.business_model = Array.isArray(data.businessModel) ? data.businessModel.join(";") : data.businessModel;
            properties.industry___mb = Array.isArray(data.industry) ? data.industry.join(";") : data.industry;
            if (userType === "retailer") properties.retail_locations = data.locations;
        } else if (isConsumer) {
            properties.consumer_request_type___mb = data.help;
        } else if (isOther) {
            properties.company = data.companyName;
            properties.website = data.companyWebsite;
            properties.customer_type___other_type = data.specify;
            properties.message = data.message; // Send textarea message as message property
        }

        // 3. Create/Update Contact
        let contactId = await updateHubSpotContact(data.email, properties);

        // 4. Add to List
        if (HUBSPOT_CONFIG.LIST_IDS.INQUIRIES && contactId) {
            await addContactToList(contactId, HUBSPOT_CONFIG.LIST_IDS.INQUIRIES);
        }

        // 5. Deal Creation (Paul Only)
        if (ownerId === HUBSPOT_CONFIG.OWNER_IDS.PAUL && data.companyName) {
            await createDeal(contactId, data.companyName, ownerId);
        }

        // 6. Sequence Enrollment vs. Auto-Response
        let enrolledInSequence = false;

        if (isBusinessUser && data.help === "Purchasing request") {
            const hasPresence = isUSA || isNaarEuCn; // Re-using our boolean checks from above covers all defined lists.

            const sequenceId = determineSequenceId(userType, isUSA, hasPresence);

            if (sequenceId) {
                // Map ownerId to constant name for ENROLLERS lookup
                const ownerKey = getOwnerKeyFromId(ownerId);
                const enrollerConfig = HUBSPOT_CONFIG.ENROLLERS[ownerKey] || HUBSPOT_CONFIG.ENROLLERS.DEFAULT;

                console.log(`Enrolling in sequence. Owner: ${ownerId} (${ownerKey}), Sequence: ${sequenceId}, Enroller:`, enrollerConfig);

                if (!enrollerConfig.userId) {
                    console.error("No userId found for enroller:", ownerKey);
                } else {
                    await enrollInSequence(contactId, sequenceId, enrollerConfig.userId, enrollerConfig.email);
                    enrolledInSequence = true;
                }
            }
        }

        // 7. Send Internal Notification
        // CC Rules: Paul gets Zalpha CC'd, everyone else gets Chris
        let ccRecipients = EMAIL_CONFIG.CC_RULES.DEFAULT;
        if (ownerId === HUBSPOT_CONFIG.OWNER_IDS.PAUL) {
            ccRecipients = EMAIL_CONFIG.CC_RULES.PAUL;
        }

        // Build shop types / business model string for email
        let shopTypesStr = "";
        if (data.businessModel) {
            shopTypesStr = Array.isArray(data.businessModel) ? data.businessModel.join(", ") : data.businessModel;
        }
        if (data.industry) {
            const industryStr = Array.isArray(data.industry) ? data.industry.join(", ") : data.industry;
            shopTypesStr = shopTypesStr ? `${shopTypesStr}; Industry: ${industryStr}` : industryStr;
        }

        // Map data to match SMTP2GO template variable names (lowercase)
        await sendEmail({
            to: internalRecipientEmail,
            cc: ccRecipients,
            bcc: EMAIL_CONFIG.BCC_RULES.ALL,
            templateId: SMTP2GO_CONFIG.TEMPLATES.INTERNAL_NOTIFICATION,
            data: {
                userType: mapUserTypeToLabel(userType),
                firstname: data.firstName,
                lastname: data.lastName,
                companyname: data.companyName || "",
                companywebsite: data.companyWebsite || "",
                country: data.country || "",
                phone: data.phone || "",
                email: data.email,
                hearAboutUs: data.hearAbout || "",
                howCanWeHelpYou: data.help || "",
                numberOfLocations: data.locations || "",
                subject: data.help || (isOther ? "Other Request" : ""),
                message: data.message || data.otherDetails || "",
                shopTypes: shopTypesStr,
                specify: data.specify || "",
                contactId,
            },
        });

        // 8. Get Consumer Response Content (for both screen display and email)
        let consumerResponseHtml = "";
        if (isConsumer) {
            consumerResponseHtml = getConsumerResponseContent(data.help);
        }

        // 9. Send Customer Auto-Response (If NOT enrolled in sequence)
        if (!enrolledInSequence) {
            let customerTemplate = SMTP2GO_CONFIG.TEMPLATES.CUSTOMER_RESPONSE;
            let emailVariables = { firstName: data.firstName, lastName: data.lastName };

            if (isBusinessUser && data.help === "Customized lighters request") {
                customerTemplate = SMTP2GO_CONFIG.TEMPLATES.CUSTOM_LIGHTERS;
            } else if (isBusinessUser && data.help === "Marketing material request") {
                customerTemplate = SMTP2GO_CONFIG.TEMPLATES.MARKETING_MATERIAL;
            } else if (isConsumer) {
                customerTemplate = SMTP2GO_CONFIG.TEMPLATES.CUSTOMER_AUTO_RESPONSE;
                emailVariables.content = consumerResponseHtml; // Send the response content in email
            }

            if (customerTemplate) {
                await sendEmail({
                    to: data.email,
                    bcc: EMAIL_CONFIG.BCC_RULES.ALL,
                    templateId: customerTemplate,
                    data: emailVariables,
                });
            }
        }

        // 10. Return Success with Consumer Content (for screen display)
        const responsePayload = { success: true, contactId };
        if (isConsumer && consumerResponseHtml) {
            responsePayload.consumerResponse = consumerResponseHtml;
        }

        res.status(200).json(responsePayload);
    } catch (error) {
        console.error("Error processing form:", error);
        // Send Error Email to Ralph
        try {
            await sendEmail({
                to: EMAIL_CONFIG.ERROR_RECIPIENTS,
                templateId: SMTP2GO_CONFIG.TEMPLATES.INTERNAL_NOTIFICATION,
                data: {
                    subject: "URGENT: Contact Form Error",
                    message: `An error occurred while processing a contact form submission.\n\nError Message: ${error.message}\n\nStack Trace:\n${error.stack}`,
                    userType: "System Error",
                    email: "system@zengaz.com",
                    firstname: "System",
                    lastname: "Error",
                },
            });
        } catch (emailError) {
            console.error("Failed to send error email:", emailError.message);
        }
        res.status(500).json({ error: error.message });
    }
}

function mapUserTypeToLabel(type) {
    const map = {
        distributor: "Distributor/Wholesaler",
        retailer: "Shop/Retailer",
        consumer: "Consumer",
        other: "Other",
    };
    return map[type] || type;
}

function getOwnerKeyFromId(ownerId) {
    // Map ownerId (numeric string) to OWNER_IDS constant name
    for (const [key, value] of Object.entries(HUBSPOT_CONFIG.OWNER_IDS)) {
        if (value === ownerId) {
            return key;
        }
    }
    return "DEFAULT";
}

function getConsumerResponseContent(subject) {
    return CONSUMER_RESPONSES[subject] || CONSUMER_RESPONSES.DEFAULT;
}

function determineSequenceId(userType, isUSA, hasPresence) {
    if (userType === "distributor") {
        if (isUSA) return HUBSPOT_CONFIG.SEQUENCE_IDS.USA_DISTRIBUTOR;
        return hasPresence ? HUBSPOT_CONFIG.SEQUENCE_IDS.DISTRIBUTOR_PRESENCE : HUBSPOT_CONFIG.SEQUENCE_IDS.DISTRIBUTOR_NO_PRESENCE;
    }
    if (userType === "retailer") {
        if (isUSA) return HUBSPOT_CONFIG.SEQUENCE_IDS.USA_RETAILER;
        return hasPresence ? HUBSPOT_CONFIG.SEQUENCE_IDS.RETAILER_PRESENCE : HUBSPOT_CONFIG.SEQUENCE_IDS.RETAILER_NO_PRESENCE;
    }
    return null;
}

async function updateHubSpotContact(email, properties) {
    try {
        const search = await hubspotClient.crm.contacts.searchApi.doSearch({
            filterGroups: [{ filters: [{ propertyName: "email", operator: "EQ", value: email }] }],
        });

        if (search.total > 0) {
            const contactId = search.results[0].id;
            await hubspotClient.crm.contacts.basicApi.update(contactId, { properties });
            console.log("Updated contact:", contactId);
            return contactId;
        } else {
            const create = await hubspotClient.crm.contacts.basicApi.create({ properties });
            console.log("Created contact:", create.id);
            return create.id;
        }
    } catch (e) {
        console.error("HubSpot Contact Error:", e.message);
        throw e;
    }
}

async function addContactToList(contactId, listId) {
    // Note: The V3 API for list membership is complex/different.
    // This is a placeholder wrapper. If using legacy V1 endpoint logic manually:
    try {
        // Legacy V1 API Endpoint manual call might be needed if V3 client doesn't support simple list add yet
        const response = await axios.post(
            `https://api.hubapi.com/contacts/v1/lists/${listId}/add`,
            {
                vids: [Number(contactId)],
            },
            {
                headers: { Authorization: `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}` },
            }
        );
        console.log(`Added ${contactId} to list ${listId}`);
    } catch (e) {
        console.error("HubSpot List Error:", e.response?.data || e.message);
    }
}

async function createDeal(contactId, companyName, ownerId) {
    try {
        const DealInput = {
            properties: {
                dealname: companyName,
                hubspot_owner_id: ownerId,
                dealtype: "newbusiness",
                dealstage: "appointmentscheduled",
            },
            associations: [
                {
                    to: { id: contactId },
                    types: [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: 3 }], // 3 is Contact-to-Deal
                },
            ],
        };
        const response = await hubspotClient.crm.deals.basicApi.create(DealInput);
        console.log(`Created Deal ${response.id} for contact ${contactId}`);
    } catch (e) {
        console.error("HubSpot Deal Error:", e.message);
    }
}

async function enrollInSequence(contactId, sequenceId, userId, senderEmail) {
    try {
        // Automation V4 API for enrollment
        // Endpoint: POST /automation/v4/sequences/enrollments
        const url = `https://api.hubapi.com/automation/v4/sequences/enrollments?userId=${userId}`;
        const payload = {
            contactId,
            sequenceId,
            senderEmail,
        };

        await axios.post(url, payload, {
            headers: { Authorization: `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}` },
        });
        console.log(`Enrolled ${contactId} in sequence ${sequenceId} by ${senderEmail} (userId: ${userId})`);
    } catch (e) {
        console.error("Sequence Enrollment Error:", e.response?.data || e.message);
    }
}

async function sendEmail({ to, cc = [], bcc = [], templateId, data }) {
    try {
        const payload = {
            api_key: process.env.SMTP2GO_API_KEY,
            to: Array.isArray(to) ? to : [to],
            sender: "ZENGAZ <hello@zengaz.net>",
            template_id: templateId,
            custom_headers: [{ header: "Reply-To", value: "hello@zengaz.net" }],
            template_data: data, // SMTP2GO uses template_data, not data
        };

        if (cc && cc.length > 0) payload.cc = cc;
        if (bcc && bcc.length > 0) payload.bcc = bcc;

        // DEBUG: Log the full payload being sent to SMTP2GO
        console.log("========== SMTP2GO EMAIL DEBUG ==========");
        console.log("Template ID:", templateId);
        console.log("To:", to);
        console.log("CC:", cc);
        console.log("BCC:", bcc);
        console.log("Template Data:", JSON.stringify(data, null, 2));
        console.log("Full Payload (excluding API key):", JSON.stringify({ ...payload, api_key: "[REDACTED]" }, null, 2));
        console.log("==========================================");

        const response = await axios.post("https://api.smtp2go.com/v3/email/send", payload);
        console.log(`Email sent successfully! Template: ${templateId}, To: ${to}`);
        console.log("SMTP2GO Response:", JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error("SMTP2GO Error:", error.response?.data || error.message);
        console.error("Failed payload (excluding API key):", JSON.stringify({ ...arguments[0], api_key: "[REDACTED]" }, null, 2));
    }
}
