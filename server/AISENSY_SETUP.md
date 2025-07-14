# AiSensy WhatsApp Business API Integration Setup

This guide will help you set up AiSensy WhatsApp Business API integration for your Hajiz application.

## Prerequisites

1. **Business Website**: You must have a business website to apply for WhatsApp Business API
2. **Facebook Business Manager Account**: Required for WhatsApp Business API
3. **Phone Number**: A fresh phone number that isn't registered with any WhatsApp account

## Step 1: Create AiSensy Account

1. Go to [AiSensy Signup Page](https://app.aisensy.com/signup)
2. Sign up using your Google account or fill out the form with your business email
3. Enter OTP (if you signed up via form)
4. Add your personal and company details:
   - Company Name
   - Industry
   - Business Size
   - Billing Currency
   - Timezone
5. Click 'Complete Sign Up'

## Step 2: Apply for WhatsApp Business API

1. In your AiSensy dashboard, click 'Continue with Facebook'
2. Make sure you have admin access to your Facebook Business Manager account
3. Click 'Continue' to redirect to Meta window
4. Click 'Get Started' to connect your Facebook account with AiSensy
5. Select your Facebook Business Manager Account
6. Create a new WhatsApp Business Profile
7. Add your business address details:
   - WhatsApp Business account name
   - WhatsApp Business Display name
   - Business category
8. Add your phone number for WhatsApp Business API
9. Verify your phone number via SMS or voice call

## Step 3: Get Your API Key

1. Once your WhatsApp Business API is approved (usually within 10 minutes)
2. Go to AiSensy App → Manage → API Key
3. Copy your API Key

## Step 4: Create API Campaign

1. In AiSensy App, go to Campaigns
2. Click +Launch and select 'API Campaign'
3. Add a campaign name (e.g., 'verification_campaign')
4. Select a pre-approved template for verification messages
5. Set the API campaign live

**Note**: You need to create and get approval for WhatsApp message templates before creating the API campaign.

## Step 5: Create WhatsApp Message Template

1. Go to Templates section in AiSensy
2. Create a new template for verification messages
3. Template example:
   ```
   Your verification code for Hajiz is: {{1}}
   This code will expire in 10 minutes.
   ```
4. Submit for approval (usually takes 10 minutes to 1 hour)

## Step 6: Update Environment Variables

Update your `.env` file with the following:

```env
# AiSensy Configuration (for WhatsApp Business API)
AISENSY_API_KEY=your_actual_api_key_here
AISENSY_CAMPAIGN_NAME=verification_campaign
```

Replace:
- `your_actual_api_key_here` with your actual AiSensy API key
- `verification_campaign` with your actual campaign name

## Step 7: Test the Integration

1. Start your server: `npm run dev`
2. Try registering a new user or requesting password reset
3. Check if WhatsApp messages are being sent successfully
4. Monitor the console logs for any errors

## API Endpoint Details

The integration uses AiSensy's API endpoint:
- **URL**: `https://backend.aisensy.com/campaign/t1/api/v2`
- **Method**: POST
- **Content-Type**: application/json

## Payload Structure

```json
{
  "apiKey": "your_api_key",
  "campaignName": "verification_campaign",
  "destination": "+1234567890",
  "userName": "User",
  "templateParams": ["123456"],
  "source": "Hajiz App"
}
```

## Important Notes

1. **Free Plan**: AiSensy offers a forever free plan with:
   - 1,000 free conversations per month
   - Free WhatsApp Business API access
   - Free template message approvals

2. **Phone Number Format**: 
   - Must include country code
   - Format: +[country_code][phone_number]
   - Example: +1234567890

3. **Template Messages**: 
   - All business-initiated messages must use approved templates
   - Templates need to be created and approved before use
   - Approval usually takes 10 minutes to 1 hour

4. **Rate Limits**: 
   - Follow WhatsApp's messaging policies
   - Respect user opt-outs
   - Don't send spam messages

## Troubleshooting

### Common Issues:

1. **API Key Error**: Make sure your API key is correct and active
2. **Campaign Not Found**: Ensure your campaign name matches exactly
3. **Template Not Approved**: Wait for template approval before testing
4. **Phone Number Format**: Ensure phone numbers include country code
5. **Rate Limiting**: Don't send too many messages in a short time

### Error Codes:

- **400**: Bad request - check your payload format
- **401**: Unauthorized - check your API key
- **404**: Campaign not found - check campaign name
- **429**: Rate limit exceeded - slow down your requests

## Support

If you encounter issues:
1. Check AiSensy documentation: [https://faq.aisensy.com/](https://faq.aisensy.com/)
2. Contact AiSensy support via their platform
3. Check WhatsApp Business API policies

## Migration from Twilio

The application has been successfully migrated from Twilio to AiSensy:
- ✅ Removed Twilio dependencies
- ✅ Updated notification service
- ✅ Added axios for HTTP requests
- ✅ Updated environment variables
- ✅ Maintained same functionality for verification codes

Your verification system will work the same way, but now uses AiSensy's WhatsApp Business API instead of Twilio.