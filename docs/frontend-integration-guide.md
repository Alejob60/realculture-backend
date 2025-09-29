# RealCulture AI Frontend Integration Guide

## Overview
This document provides a comprehensive guide for frontend developers to integrate with all backend endpoints of the RealCulture AI platform. The backend is built with NestJS and exposes RESTful APIs for various functionalities including authentication, user management, content generation, and media processing.

## Base URLs
- **Local Development**: `http://localhost:3001`
- **Production**: `https://realculture-backend-g3b9deb2fja4b8a2.canadacentral-01.azurewebsites.net`

## Authentication Flow
Most endpoints require authentication using JWT tokens. Follow this flow:

1. Register or Login to obtain tokens
2. Use the access token in the `Authorization: Bearer {token}` header for protected endpoints
3. Use the refresh token to obtain new access tokens when they expire

## API Endpoints

### 1. Authentication Endpoints

#### Register
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

Response:
```json
{
  "token": "access_token",
  "refreshToken": "refresh_token",
  "userId": "user_id",
  "email": "john@example.com",
  "name": "John Doe",
  "role": "CREATOR",
  "credits": 100
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword"
}
```

Response:
```json
{
  "token": "access_token",
  "refreshToken": "refresh_token",
  "userId": "user_id",
  "email": "john@example.com",
  "name": "John Doe",
  "role": "CREATOR",
  "credits": 95
}
```

#### Google Login
```
POST /api/auth/google-login
Content-Type: application/json

{
  "token": "google_id_token"
}
```

#### Refresh Token
```
POST /api/auth/refresh
Authorization: Bearer {refresh_token}
```

#### Logout
```
POST /api/auth/logout
Authorization: Bearer {access_token}
```

#### Get Current User
```
GET /api/auth/me
Authorization: Bearer {access_token}
```

### 2. User Management Endpoints

#### Get User Credits
```
GET /api/user/credits
Authorization: Bearer {access_token}
```

#### Get User Profile
```
GET /api/user/me
Authorization: Bearer {access_token}
```

#### Get User Images
```
GET /api/user/images
Authorization: Bearer {access_token}
```

#### Admin: Set User Credits
```
PATCH /api/user/admin/set-credits
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "credits": 150
}
```

#### Decrement User Credits
```
PATCH /api/user/decrement-credits
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "amount": 10
}
```

#### Upgrade User Plan
```
PATCH /api/user/upgrade
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "newPlan": "PRO"
}
```

### 3. Media Generation Endpoints

#### Generate Media (Generic)
```
POST /api/media/{type}
Authorization: Bearer {access_token}
Content-Type: application/json

// For image generation
{
  "prompt": "A beautiful landscape"
}

// For video generation
{
  "prompt": "Create a video about space exploration"
}

// For voice generation
{
  "prompt": "Narrate a story about adventure"
}

// For music generation
{
  "prompt": "Energetic electronic music"
}
```

#### Get Generated Images
```
GET /api/media/images
Authorization: Bearer {access_token}
```

#### Get My Images
```
GET /api/media/my-images
Authorization: Bearer {access_token}
```

#### Proxy Image
```
GET /api/media/proxy-image?url={image_url}
Authorization: Bearer {access_token}
```

#### Get Signed Image URL
```
GET /api/media/signed-image/{filename}
Authorization: Bearer {access_token}
```

#### Preview Audio
```
GET /api/media/preview/{filename}
Authorization: Bearer {access_token}
```

### 4. Promo Image Generation
```
POST /api/promo-image
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "prompt": "Create a promotional image for a tech product"
}
```

### 5. AI Endpoints

#### Generate Promo Content
```
POST /api/ai/generate-promo
Content-Type: application/json

{
  "prompt": "Create promotional content for a new product"
}
```

### 6. RAG (Retrieval Augmented Generation) Endpoints

#### Generate Response
```
POST /api/rag/respond
Content-Type: application/json

{
  "prompt": "Explain quantum computing in simple terms"
}
```

### 7. Influencer Endpoints

#### Create Influencer
```
POST /api/influencers
Content-Type: application/json

{
  "name": "Influencer Name",
  "extra": "Additional information"
}
```

#### Get All Influencers
```
GET /api/influencers
```

#### Get Specific Influencer
```
GET /api/influencers/{id}
```

### 8. Audio Endpoints

#### Generate Audio
```
POST /api/audio/generate
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "prompt": "Create a narrative about technology",
  "duration": 30
}
```

#### Complete Audio Generation
```
POST /api/audio/complete
Content-Type: application/json

{
  "userId": "user_id",
  "prompt": "Narrative prompt",
  "audioUrl": "url_to_audio_file",
  "duration": 30
}
```

### 9. Video Endpoints

#### Generate Video
```
POST /api/video/generate
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "prompt": "Create a video about cultural diversity"
}
```

### 10. Prompt JSON Endpoint

#### Generate JSON from Prompt
```
POST /api/prompt-json
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "prompt": "Create a JSON structure for a product catalog"
}
```

### 11. Health Check Endpoints

#### Ping
```
GET /api/health/ping
```

#### Database Health
```
GET /api/health/db
```

## Gallery/Media Library Endpoints

The gallery provides access to all generated media content including videos with their associated audio files, scripts, and SRT subtitles, as well as images with their prompts.

### Get User Gallery (Creator/PRO only)
```
GET /api/gallery
Authorization: Bearer {access_token}
```

Response:
```json
[
  {
    "id": "content_id",
    "title": "Content Title",
    "description": "Content Description",
    "type": "video|image|audio|text|other",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "sasUrl": "https://storageaccount.blob.core.windows.net/container/file.mp4?sv=...",
    "previewUrl": "https://storageaccount.blob.core.windows.net/container/thumbnails/file.mp4?sv=..."
  }
]
```

### Get My Images
```
GET /api/media/my-images
Authorization: Bearer {access_token}
```

Response:
```json
{
  "data": [
    {
      "id": "image_id",
      "prompt": "Prompt used to generate the image",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "expiresAt": "2023-02-01T00:00:00.000Z",
      "url": "https://storageaccount.blob.core.windows.net/container/image.png?sv=..."
    }
  ],
  "total": 10,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

### Video Content Structure
Videos in the gallery include the following components:
- **Video File**: The main video file
- **Audio File**: The voice narration track
- **Script**: The text script used for the voice narration
- **SRT Subtitles**: Subtitle file in SRT format

### Image Content Structure
Images in the gallery include:
- **Image File**: The generated image file
- **Prompt**: The prompt used to generate the image

## Error Handling
All endpoints follow standard HTTP status codes:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

Error responses follow this format:
```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request"
}
```

## CORS Configuration
The backend is configured to accept requests from:
- http://localhost:3000
- http://localhost:4200
- https://misybot.com
- https://www.misybot.com
- https://realculture.misybot.com
- https://realculture-app.azurewebsites.net

## Rate Limiting
The API implements rate limiting to prevent abuse. If you exceed the limit, you'll receive a 429 status code.

## Best Practices

1. **Token Management**: Always store tokens securely (preferably in HttpOnly cookies)
2. **Error Handling**: Implement comprehensive error handling for all API calls
3. **Loading States**: Show loading indicators during API requests
4. **Caching**: Cache appropriate data to reduce API calls
5. **Validation**: Validate user input before sending to the backend
6. **Security**: Never expose tokens in client-side code or logs

## Example Implementation (JavaScript/TypeScript)

```javascript
// Authentication service
class AuthService {
  async login(email, password) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      throw new Error('Login failed');
    }
    
    return await response.json();
  }
  
  async register(name, email, password) {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });
    
    if (!response.ok) {
      throw new Error('Registration failed');
    }
    
    return await response.json();
  }
}

// Media service
class MediaService {
  constructor(token) {
    this.token = token;
  }
  
  async generateImage(prompt) {
    const response = await fetch('/api/media/image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`,
      },
      body: JSON.stringify({ prompt }),
    });
    
    if (!response.ok) {
      throw new Error('Image generation failed');
    }
    
    return await response.json();
  }
  
  async generateVideo(prompt) {
    const response = await fetch('/api/video/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`,
      },
      body: JSON.stringify({ prompt }),
    });
    
    if (!response.ok) {
      throw new Error('Video generation failed');
    }
    
    return await response.json();
  }
  
  async getGallery() {
    const response = await fetch('/api/gallery', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch gallery');
    }
    
    return await response.json();
  }
  
  async getMyImages(page = 1, limit = 10) {
    const response = await fetch(`/api/media/my-images?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch images');
    }
    
    return await response.json();
  }
}
```

### Gallery Component Example (React)

```jsx
import React, { useState, useEffect } from 'react';

const GalleryComponent = ({ token }) => {
  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchGallery();
  }, []);
  
  const fetchGallery = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/gallery', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch gallery');
      }
      
      const data = await response.json();
      setMediaItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const groupMediaByType = (items) => {
    return items.reduce((groups, item) => {
      const type = item.type;
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(item);
      return groups;
    }, {});
  };
  
  const renderVideoItem = (item) => (
    <div key={item.id} className="media-item video-item">
      <h3>{item.title}</h3>
      <p>{item.description}</p>
      <div className="video-content">
        <video controls>
          <source src={item.sasUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        {item.previewUrl && (
          <img src={item.previewUrl} alt="Video preview" />
        )}
      </div>
      <p className="created-at">Created: {new Date(item.createdAt).toLocaleString()}</p>
    </div>
  );
  
  const renderImageItem = (item) => (
    <div key={item.id} className="media-item image-item">
      <h3>{item.title}</h3>
      <p>{item.description}</p>
      {item.sasUrl && (
        <img src={item.sasUrl} alt={item.title} />
      )}
      <p className="created-at">Created: {new Date(item.createdAt).toLocaleString()}</p>
    </div>
  );
  
  if (loading) return <div>Loading gallery...</div>;
  if (error) return <div>Error: {error}</div>;
  
  const groupedItems = groupMediaByType(mediaItems);
  
  return (
    <div className="gallery">
      <h2>Media Gallery</h2>
      
      {Object.keys(groupedItems).map(type => (
        <div key={type} className="media-section">
          <h3>{type.charAt(0).toUpperCase() + type.slice(1)}s</h3>
          <div className="media-grid">
            {groupedItems[type].map(item => {
              switch (item.type) {
                case 'video':
                  return renderVideoItem(item);
                case 'image':
                  return renderImageItem(item);
                default:
                  return (
                    <div key={item.id} className="media-item">
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                      {item.sasUrl && (
                        <a href={item.sasUrl} target="_blank" rel="noopener noreferrer">
                          View File
                        </a>
                      )}
                      <p className="created-at">Created: {new Date(item.createdAt).toLocaleString()}</p>
                    </div>
                  );
              }
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default GalleryComponent;
```

## Testing Endpoints
You can test all endpoints using the provided cURL examples in the BACKEND_CURLS.md file or by using the Swagger UI documentation available at:
- Local: http://localhost:3001/api/docs
- Production: https://realculture-backend-g3b9deb2fja4b8a2.canadacentral-01.azurewebsites.net/api/docs

For detailed information about the gallery endpoints, please refer to the [Gallery API Documentation](gallery-api-docs.md).

## Support
For any issues or questions about the API, please contact the backend team or refer to the documentation in the backend repository.