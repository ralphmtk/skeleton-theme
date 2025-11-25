# Contact Form Scenarios - Complete Breakdown

## Issues Fixed:

1. ✅ **CC Zalpha for Paul**: All emails to Paul now CC Zalpha + Chris
2. ✅ **hello@zengaz.net ownership**: Fixed to reflect YARA controls it (not Karim)
3. ✅ **Email sender name**: Changed to "ZENGAZ" (was "Zengaz")
4. ✅ **Other user message**: Now sends textarea message as `message` property to HubSpot

## Important Logic Note:

**"NAAR/EU/CN no presence" does NOT exist** - If a country is in NAAR/EU/CN routing lists, it ALWAYS has presence. The NO_PRESENCE sequences are ONLY for ROW (Rest of World) countries that are NOT in any routing list.

## Complete Scenario Table

| User Type       | Country Region              | Request Type        | HubSpot Owner | Internal Email To | CC             | BCC   | HubSpot Properties                                                                                                                      | Deal Created? | Sequence Enrolled? | Sequence ID                         | Enrolled By (User/Email)                    | Customer Email Template          | Customer Email Sent? | Consumer Response HTML?        |
| --------------- | --------------------------- | ------------------- | ------------- | ----------------- | -------------- | ----- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ------------------ | ----------------------------------- | ------------------------------------------- | -------------------------------- | -------------------- | ------------------------------ |
| **Distributor** | USA                         | Purchasing request  | Paul          | Paul              | Chris + Zalpha | Ralph | Base + company, website, consumer**_request_type_**mb="Purchasing request", business_model, industry\_\_\_mb                            | ✅ Yes        | ✅ Yes             | USA_DISTRIBUTOR (278561288)         | Zalpha (75038571 / zalpha.rizk@naarusa.com) | ❌ None (sequence handles it)    | ❌ No                | N/A                            |
| **Distributor** | USA                         | Customized lighters | Paul          | Paul              | Chris + Zalpha | Ralph | Base + company, website, consumer**_request_type_**mb="Customized lighters request", business_model, industry\_\_\_mb                   | ✅ Yes        | ❌ No              | N/A                                 | N/A                                         | CUSTOM_LIGHTERS (6852192)        | ✅ Yes               | N/A                            |
| **Distributor** | USA                         | Marketing material  | Yara          | Yara              | Chris          | Ralph | Base + company, website, consumer**_request_type_**mb="Marketing material request", business_model, industry\_\_\_mb                    | ❌ No         | ❌ No              | N/A                                 | N/A                                         | MARKETING_MATERIAL (5319851)     | ✅ Yes               | N/A                            |
| **Distributor** | USA                         | Other               | Paul          | Paul              | Chris + Zalpha | Ralph | Base + company, website, consumer**_request_type_**mb="Other", business_model, industry\_\_\_mb                                         | ✅ Yes        | ❌ No              | N/A                                 | N/A                                         | CUSTOMER_RESPONSE (6243502)      | ✅ Yes               | N/A                            |
| **Distributor** | NAAR/EU/CN (has presence)   | Purchasing request  | Chris         | Yazbeck           | Chris          | Ralph | Base + company, website, consumer**_request_type_**mb="Purchasing request", business_model, industry\_\_\_mb                            | ❌ No         | ✅ Yes             | DISTRIBUTOR_PRESENCE (278561889)    | Yara (44723114 / hello@zengaz.net)          | ❌ None (sequence handles it)    | ❌ No                | N/A                            |
| **Distributor** | NAAR/EU/CN (has presence)   | Customized lighters | Chris         | Yazbeck           | Chris          | Ralph | Base + company, website, consumer**_request_type_**mb="Customized lighters request", business_model, industry\_\_\_mb                   | ❌ No         | ❌ No              | N/A                                 | N/A                                         | CUSTOM_LIGHTERS (6852192)        | ✅ Yes               | N/A                            |
| **Distributor** | NAAR/EU/CN (has presence)   | Marketing material  | Yara          | Yara              | Chris          | Ralph | Base + company, website, consumer**_request_type_**mb="Marketing material request", business_model, industry\_\_\_mb                    | ❌ No         | ❌ No              | N/A                                 | N/A                                         | MARKETING_MATERIAL (5319851)     | ✅ Yes               | N/A                            |
| **Distributor** | NAAR/EU/CN (has presence)   | Other               | Chris         | Yazbeck           | Chris          | Ralph | Base + company, website, consumer**_request_type_**mb="Other", business_model, industry\_\_\_mb                                         | ❌ No         | ❌ No              | N/A                                 | N/A                                         | CUSTOMER_RESPONSE (6243502)      | ✅ Yes               | N/A                            |
| **Distributor** | Rest of World (no presence) | Purchasing request  | Karim         | Karim             | Chris          | Ralph | Base + company, website, consumer**_request_type_**mb="Purchasing request", business_model, industry\_\_\_mb                            | ❌ No         | ✅ Yes             | DISTRIBUTOR_NO_PRESENCE (278558224) | Karim (44727677 / karim.attoue@zengaz.net)  | ❌ None (sequence handles it)    | ❌ No                | N/A                            |
| **Distributor** | Rest of World (no presence) | Customized lighters | Karim         | Karim             | Chris          | Ralph | Base + company, website, consumer**_request_type_**mb="Customized lighters request", business_model, industry\_\_\_mb                   | ❌ No         | ❌ No              | N/A                                 | N/A                                         | CUSTOM_LIGHTERS (6852192)        | ✅ Yes               | N/A                            |
| **Distributor** | Rest of World (no presence) | Marketing material  | Yara          | Yara              | Chris          | Ralph | Base + company, website, consumer**_request_type_**mb="Marketing material request", business_model, industry\_\_\_mb                    | ❌ No         | ❌ No              | N/A                                 | N/A                                         | MARKETING_MATERIAL (5319851)     | ✅ Yes               | N/A                            |
| **Distributor** | Rest of World (no presence) | Other               | Karim         | Karim             | Chris          | Ralph | Base + company, website, consumer**_request_type_**mb="Other", business_model, industry\_\_\_mb                                         | ❌ No         | ❌ No              | N/A                                 | N/A                                         | CUSTOMER_RESPONSE (6243502)      | ✅ Yes               | N/A                            |
| **Retailer**    | USA                         | Purchasing request  | Paul          | Paul              | Chris + Zalpha | Ralph | Base + company, website, consumer**_request_type_**mb="Purchasing request", business_model, industry\_\_\_mb, retail_locations          | ✅ Yes        | ✅ Yes             | USA_RETAILER (278561907)            | Zalpha (75038571 / zalpha.rizk@naarusa.com) | ❌ None (sequence handles it)    | ❌ No                | N/A                            |
| **Retailer**    | USA                         | Customized lighters | Paul          | Paul              | Chris + Zalpha | Ralph | Base + company, website, consumer**_request_type_**mb="Customized lighters request", business_model, industry\_\_\_mb, retail_locations | ✅ Yes        | ❌ No              | N/A                                 | N/A                                         | CUSTOM_LIGHTERS (6852192)        | ✅ Yes               | N/A                            |
| **Retailer**    | USA                         | Marketing material  | Yara          | Yara              | Chris          | Ralph | Base + company, website, consumer**_request_type_**mb="Marketing material request", business_model, industry\_\_\_mb, retail_locations  | ❌ No         | ❌ No              | N/A                                 | N/A                                         | MARKETING_MATERIAL (5319851)     | ✅ Yes               | N/A                            |
| **Retailer**    | USA                         | Other               | Paul          | Paul              | Chris + Zalpha | Ralph | Base + company, website, consumer**_request_type_**mb="Other", business_model, industry\_\_\_mb, retail_locations                       | ✅ Yes        | ❌ No              | N/A                                 | N/A                                         | CUSTOMER_RESPONSE (6243502)      | ✅ Yes               | N/A                            |
| **Retailer**    | NAAR/EU/CN (has presence)   | Purchasing request  | Chris         | Yazbeck           | Chris          | Ralph | Base + company, website, consumer**_request_type_**mb="Purchasing request", business_model, industry\_\_\_mb, retail_locations          | ❌ No         | ✅ Yes             | RETAILER_PRESENCE (278553939)       | Yara (44723114 / hello@zengaz.net)          | ❌ None (sequence handles it)    | ❌ No                | N/A                            |
| **Retailer**    | NAAR/EU/CN (has presence)   | Customized lighters | Chris         | Yazbeck           | Chris          | Ralph | Base + company, website, consumer**_request_type_**mb="Customized lighters request", business_model, industry\_\_\_mb, retail_locations | ❌ No         | ❌ No              | N/A                                 | N/A                                         | CUSTOM_LIGHTERS (6852192)        | ✅ Yes               | N/A                            |
| **Retailer**    | NAAR/EU/CN (has presence)   | Marketing material  | Yara          | Yara              | Chris          | Ralph | Base + company, website, consumer**_request_type_**mb="Marketing material request", business_model, industry\_\_\_mb, retail_locations  | ❌ No         | ❌ No              | N/A                                 | N/A                                         | MARKETING_MATERIAL (5319851)     | ✅ Yes               | N/A                            |
| **Retailer**    | NAAR/EU/CN (has presence)   | Other               | Chris         | Yazbeck           | Chris          | Ralph | Base + company, website, consumer**_request_type_**mb="Other", business_model, industry\_\_\_mb, retail_locations                       | ❌ No         | ❌ No              | N/A                                 | N/A                                         | CUSTOMER_RESPONSE (6243502)      | ✅ Yes               | N/A                            |
| **Retailer**    | Rest of World (no presence) | Purchasing request  | Karim         | Karim             | Chris          | Ralph | Base + company, website, consumer**_request_type_**mb="Purchasing request", business_model, industry\_\_\_mb, retail_locations          | ❌ No         | ✅ Yes             | RETAILER_NO_PRESENCE (278553917)    | Karim (44727677 / karim.attoue@zengaz.net)  | ❌ None (sequence handles it)    | ❌ No                | N/A                            |
| **Retailer**    | Rest of World (no presence) | Customized lighters | Karim         | Karim             | Chris          | Ralph | Base + company, website, consumer**_request_type_**mb="Customized lighters request", business_model, industry\_\_\_mb, retail_locations | ❌ No         | ❌ No              | N/A                                 | N/A                                         | CUSTOM_LIGHTERS (6852192)        | ✅ Yes               | N/A                            |
| **Retailer**    | Rest of World (no presence) | Marketing material  | Yara          | Yara              | Chris          | Ralph | Base + company, website, consumer**_request_type_**mb="Marketing material request", business_model, industry\_\_\_mb, retail_locations  | ❌ No         | ❌ No              | N/A                                 | N/A                                         | MARKETING_MATERIAL (5319851)     | ✅ Yes               | N/A                            |
| **Retailer**    | Rest of World (no presence) | Other               | Karim         | Karim             | Chris          | Ralph | Base + company, website, consumer**_request_type_**mb="Other", business_model, industry\_\_\_mb, retail_locations                       | ❌ No         | ❌ No              | N/A                                 | N/A                                         | CUSTOMER_RESPONSE (6243502)      | ✅ Yes               | N/A                            |
| **Consumer**    | Any Country                 | Review              | Yara          | Yara              | Chris          | Ralph | Base + consumer_request_type\_\_\_mb="Review"                                                                                           | ❌ No         | ❌ No              | N/A                                 | N/A                                         | CUSTOMER_AUTO_RESPONSE (0142300) | ✅ Yes               | ✅ Yes (Google Reviews link)   |
| **Consumer**    | Any Country                 | How to refill       | Yara          | Yara              | Chris          | Ralph | Base + consumer_request_type\_\_\_mb="How to refill my Zengaz jet lighter?"                                                             | ❌ No         | ❌ No              | N/A                                 | N/A                                         | CUSTOMER_AUTO_RESPONSE (0142300) | ✅ Yes               | ✅ Yes (Refill instructions)   |
| **Consumer**    | Any Country                 | Replacement parts   | Yara          | Yara              | Chris          | Ralph | Base + consumer_request_type\_\_\_mb="Do you sell replacement parts?"                                                                   | ❌ No         | ❌ No              | N/A                                 | N/A                                         | CUSTOMER_AUTO_RESPONSE (0142300) | ✅ Yes               | ✅ Yes (Warranty info)         |
| **Consumer**    | Any Country                 | Not sparking        | Yara          | Yara              | Chris          | Ralph | Base + consumer_request_type\_\_\_mb="My lighter is not sparking"                                                                       | ❌ No         | ❌ No              | N/A                                 | N/A                                         | CUSTOMER_AUTO_RESPONSE (0142300) | ✅ Yes               | ✅ Yes (Troubleshooting steps) |
| **Consumer**    | Any Country                 | Fuel leaking        | Yara          | Yara              | Chris          | Ralph | Base + consumer_request_type\_\_\_mb="Fuel is leaking from my lighter"                                                                  | ❌ No         | ❌ No              | N/A                                 | N/A                                         | CUSTOMER_AUTO_RESPONSE (0142300) | ✅ Yes               | ✅ Yes (Troubleshooting steps) |
| **Consumer**    | Any Country                 | Where to buy        | Yara          | Yara              | Chris          | Ralph | Base + consumer_request_type\_\_\_mb="Where can I buy Zengaz jet lighters?"                                                             | ❌ No         | ❌ No              | N/A                                 | N/A                                         | CUSTOMER_AUTO_RESPONSE (0142300) | ✅ Yes               | ✅ Yes (Shop link)             |
| **Consumer**    | Any Country                 | Specific design     | Yara          | Yara              | Chris          | Ralph | Base + consumer_request_type\_\_\_mb="I am looking for a specific design"                                                               | ❌ No         | ❌ No              | N/A                                 | N/A                                         | CUSTOMER_AUTO_RESPONSE (0142300) | ✅ Yes               | ✅ Yes (Contact info)          |
| **Consumer**    | Any Country                 | Custom Lighters     | Yara          | Yara              | Chris          | Ralph | Base + consumer_request_type\_\_\_mb="Custom Lighters"                                                                                  | ❌ No         | ❌ No              | N/A                                 | N/A                                         | CUSTOMER_AUTO_RESPONSE (0142300) | ✅ Yes               | ✅ Yes (Default response)      |
| **Consumer**    | Any Country                 | Other               | Yara          | Yara              | Chris          | Ralph | Base + consumer_request_type\_\_\_mb="Other"                                                                                            | ❌ No         | ❌ No              | N/A                                 | N/A                                         | CUSTOMER_AUTO_RESPONSE (0142300) | ✅ Yes               | ✅ Yes (Default response)      |
| **Other**       | Any Country                 | Any message         | Yara          | Yara              | Chris          | Ralph | Base + company, website, customer_type\_\_\_other_type, message (from textarea)                                                         | ❌ No         | ❌ No              | N/A                                 | N/A                                         | CUSTOMER_RESPONSE (6243502)      | ✅ Yes               | N/A                            |

## Key HubSpot Properties Used:

### Base Properties (All Contacts):

-   `lead_source`: "Ali Express"
-   `lead_source_details`: "Website"
-   `hs_lead_status`: "New Untouched Leads (Inbound/Outbound)"
-   `email`, `firstname`, `lastname`, `phone`, `country`
-   `how_did_you_hear_about_us____mb`
-   `lifecyclestage`: "lead"
-   `customer_type___mb`: "Distributor/Wholesaler" | "Shop/Retailer" | "Consumer" | "Other"
-   `message`: (fallback from message/otherDetails/help, or from textarea for Other type)
-   `hubspot_owner_id`: (based on routing logic)

### Business User Specific (Distributor/Retailer):

-   `company`
-   `website`
-   `consumer___request_type___mb`: "Purchasing request" | "Customized lighters request" | "Marketing material request" | "Other"
-   `business_model`: (semicolon-separated if multiple)
-   `industry___mb`: (semicolon-separated if multiple)
-   `retail_locations`: (retailer only)

### Consumer Specific:

-   `consumer_request_type___mb`: "Review" | "How to refill..." | "Do you sell..." | etc.

### Other User Specific:

-   `company`
-   `website`
-   `customer_type___other_type`: "Artist" | "Influencer" | "Brand" | etc.
-   `message`: (from textarea)

## Email Flow Summary:

### Internal Notification (Always Sent):

-   **To**: Based on routing (Paul/Yazbeck/Karim/Yara)
-   **CC**:
    -   Paul → Chris + Zalpha
    -   All others → Chris only
-   **BCC**: Ralph (always)
-   **Template**: INTERNAL_NOTIFICATION (5402787)
-   **Sender**: ZENGAZ <hello@zengaz.net>

### Customer Auto-Response (Sent if NOT enrolled in sequence):

-   **To**: Customer email
-   **BCC**: Ralph (always)
-   **Sender**: ZENGAZ <hello@zengaz.net>
-   **Templates**:
    -   CUSTOM_LIGHTERS (6852192) - Business: Customized lighters request
    -   MARKETING_MATERIAL (5319851) - Business: Marketing material request
    -   CUSTOMER_AUTO_RESPONSE (0142300) - Consumer (with dynamic content)
    -   CUSTOMER_RESPONSE (6243502) - Business: Other requests, or Other user type

## Sequence Enrollment Logic:

-   **USA**: Always gets USA sequences (USA_DISTRIBUTOR or USA_RETAILER)
-   **NAAR/EU/CN**: Countries in these lists ALWAYS have presence → Get PRESENCE sequences
-   **Rest of World**: Countries NOT in any routing list have NO presence → Get NO_PRESENCE sequences

## Notes:

-   **Presence** = Country is in ANY of the routing lists (NAAR, FC_EU, FC_CN, NAAR_USA)
-   **No Presence** = Country is NOT in any routing list (ROW only)
-   **Deal Creation**: Only for Paul (USA) with companyName
-   **Sequence Enrollment**: Only for Business users with "Purchasing request"
-   **Consumer Response HTML**: Returned in API response for frontend display
-   **hello@zengaz.net**: Controlled by YARA (used for Chris and Yara sequence enrollments)
