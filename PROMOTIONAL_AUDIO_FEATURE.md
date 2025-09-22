# Promotional Audio Feature Implementation

## Overview

This document explains the implementation of the promotional audio feature that allows users to generate audio content with a promotional/influencer style rather than simple text-to-speech narration.

## Feature Description

The updated audio generation endpoint now supports two modes:
1. **Promotional Style** (default): Generates influencer-style promotional content using AI before converting to speech
2. **Narrative Style**: Direct text-to-speech conversion without promotional enhancement

## Implementation Details

### Backend Changes

1. **Modified Endpoint**: `/audio/generate` now accepts an optional `style` parameter
2. **Default Behavior**: When no style is specified, it defaults to "promotional"
3. **AI Integration**: Uses the existing [AiService](file:///c:/MisyBot/RealCulture%20AI/backend/src/infrastructure/services/ai.service.ts#L9-L143) to generate promotional content before audio generation
4. **Fallback Mechanism**: If promotional content generation fails, it falls back to the original prompt

### API Contract

**Request**:
```json
{
  "prompt": "string",
  "duration": 20 | 30 | 60,
  "style": "promotional" | "narrative" | "casual" (optional)
}
```

**Response**:
```json
{
  "message": "Audio promocional generado con éxito",
  "script": "string",
  "audioUrl": "string",
  "duration": "number",
  "creditsUsed": "number",
  "style": "string"
}
```

### How It Works

1. User sends a prompt to the `/audio/generate` endpoint
2. If `style` is "promotional" or not specified:
   - The system calls the [AiService.generatePromo()](file:///c:/MisyBot/RealCulture%20AI/backend/src/infrastructure/services/ai.service.ts#L107-L142) method to create promotional content
   - The promotional content is then sent to the audio generation microservice
3. If `style` is "narrative" or "casual":
   - The original prompt is sent directly to the audio generation microservice
4. The generated audio is saved to the database with appropriate metadata

### Promotional Content Generation

The promotional content is generated using Azure OpenAI with a specific prompt that instructs the AI to:
- Speak like a charismatic, modern, and creative influencer
- Use viral phrases, emojis, and direct language
- Express in first person with lots of personality
- Act as the protagonist of the campaign rather than an advisor

## Frontend Integration

### Recommended UI Changes

1. Add a style selector to the audio generation form:
   - Radio buttons or dropdown with options: "Promotional" (default), "Narrative", "Casual"
   - Help text explaining the differences

2. Update the result display to show:
   - The original prompt
   - The generated promotional script (when applicable)
   - The audio player with the generated audio

### Example Implementation

```javascript
// Generate promotional audio
const generatePromotionalAudio = async (prompt, duration) => {
  const response = await fetch('/api/audio/generate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: prompt,
      duration: duration,
      style: 'promotional' // or 'narrative'
    })
  });
  
  const data = await response.json();
  return data;
};
```

## Benefits

1. **Enhanced User Experience**: Users can create more engaging promotional content
2. **Flexibility**: Supports both promotional and narrative styles
3. **Backward Compatibility**: Existing integrations continue to work with promotional as default
4. **Error Resilience**: Falls back to original prompt if promotional generation fails

## Testing

The feature has been tested with various prompts and styles:
- Short promotional phrases
- Product descriptions
- Brand messaging
- Narrative content

All tests show successful generation of promotional audio content with appropriate styling.

## Future Improvements

1. Add more style options (e.g., "professional", "friendly", "excited")
2. Allow users to customize the influencer persona
3. Add preview functionality for promotional text before audio generation
4. Implement tone and voice customization for the audio output