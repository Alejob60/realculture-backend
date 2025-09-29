# Frontend Gallery Integration Guide

## Overview
This document provides guidance for frontend developers to integrate with the gallery endpoint and load all created content available in the database.

## Gallery Endpoint Details

### Endpoint
```
GET /api/gallery
```

### Authentication
This endpoint requires a valid JWT token in the Authorization header:
```
Authorization: Bearer {access_token}
```

### Query Parameters (Optional)
- `type`: Filter by content type (image, audio, video, text, other)
- `page`: Page number for pagination (default: 1)
- `limit`: Number of items per page (default: 10)

### Response Format
The endpoint returns an array of media items with the following structure:

```json
[
  {
    "id": "string",
    "title": "string",
    "description": "string",
    "type": "image|audio|video|text|other",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "sasUrl": "string|null",
    "previewUrl": "string|null"
  }
]
```

### Response Fields
| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier for the content |
| title | string | Title of the content |
| description | string | Description of the content |
| type | string | Type of media (image, audio, video, text, other) |
| createdAt | string | ISO 8601 date when the content was created |
| sasUrl | string/null | Secure URL to access the media file (valid for 1 hour) |
| previewUrl | string/null | URL to access the preview/thumbnail |

## Media Content Structure

### Videos
Videos include:
- **sasUrl**: Link to the video file
- **previewUrl**: Link to the video thumbnail

### Images
Images include:
- **sasUrl**: Link to the image file
- **previewUrl**: Link to the image thumbnail (if available)

### Audio
Audio files include:
- **sasUrl**: Link to the audio file
- **previewUrl**: Link to the audio thumbnail (if available)

## Implementation Examples

### JavaScript/TypeScript Implementation

```javascript
class GalleryService {
  constructor(baseUrl, token) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  async getUserGallery(type = null, page = 1, limit = 10) {
    try {
      let url = `${this.baseUrl}/api/gallery?page=${page}&limit=${limit}`;
      
      if (type) {
        url += `&type=${type}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const gallery = await response.json();
      return gallery;
    } catch (error) {
      console.error('Error fetching gallery:', error);
      throw error;
    }
  }
}

// Usage example
const galleryService = new GalleryService('http://localhost:3001', userToken);

// Fetch all gallery items
const allItems = await galleryService.getUserGallery();

// Fetch only images
const images = await galleryService.getUserGallery('image');

// Fetch videos with pagination
const videos = await galleryService.getUserGallery('video', 1, 5);
```

### React Component Example

```jsx
import React, { useState, useEffect } from 'react';

const GalleryComponent = ({ token }) => {
  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchGallery();
  }, [filter]);

  const fetchGallery = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let url = 'http://localhost:3001/api/gallery';
      if (filter !== 'all') {
        url += `?type=${filter}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
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
        {item.sasUrl ? (
          <video controls>
            <source src={item.sasUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <p>Video not available</p>
        )}
        {item.previewUrl && (
          <img src={item.previewUrl} alt="Video preview" className="preview-image" />
        )}
      </div>
      <p className="created-at">Created: {new Date(item.createdAt).toLocaleString()}</p>
    </div>
  );

  const renderImageItem = (item) => (
    <div key={item.id} className="media-item image-item">
      <h3>{item.title}</h3>
      <p>{item.description}</p>
      {item.sasUrl ? (
        <img src={item.sasUrl} alt={item.title} className="gallery-image" />
      ) : (
        <p>Image not available</p>
      )}
      <p className="created-at">Created: {new Date(item.createdAt).toLocaleString()}</p>
    </div>
  );

  if (loading) return <div className="gallery-loading">Loading gallery...</div>;
  if (error) return <div className="gallery-error">Error: {error}</div>;

  const groupedItems = groupMediaByType(mediaItems);

  return (
    <div className="gallery-container">
      <h2>Media Gallery</h2>
      
      {/* Filter controls */}
      <div className="gallery-filters">
        <button 
          className={filter === 'all' ? 'active' : ''} 
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button 
          className={filter === 'image' ? 'active' : ''} 
          onClick={() => setFilter('image')}
        >
          Images
        </button>
        <button 
          className={filter === 'video' ? 'active' : ''} 
          onClick={() => setFilter('video')}
        >
          Videos
        </button>
        <button 
          className={filter === 'audio' ? 'active' : ''} 
          onClick={() => setFilter('audio')}
        >
          Audio
        </button>
      </div>
      
      {/* Gallery content */}
      {Object.keys(groupedItems).length === 0 ? (
        <p>No media items found.</p>
      ) : (
        Object.keys(groupedItems).map(type => (
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
        ))
      )}
    </div>
  );
};

export default GalleryComponent;
```

### CSS Styling

```css
.gallery-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.gallery-container h2 {
  color: #333;
  margin-bottom: 20px;
}

.gallery-filters {
  margin-bottom: 20px;
}

.gallery-filters button {
  padding: 8px 16px;
  margin-right: 10px;
  border: 1px solid #ddd;
  background-color: #f5f5f5;
  border-radius: 4px;
  cursor: pointer;
}

.gallery-filters button.active {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

.gallery-filters button:hover {
  background-color: #e9ecef;
}

.gallery-filters button.active:hover {
  background-color: #0056b3;
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 15px;
}

.media-item {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  background-color: #f9f9f9;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.media-item h3 {
  margin-top: 0;
  color: #333;
}

.media-item p {
  color: #666;
}

.video-content {
  margin: 10px 0;
}

.video-content video {
  width: 100%;
  height: auto;
  border-radius: 4px;
}

.preview-image {
  width: 100%;
  height: auto;
  margin-top: 10px;
  border-radius: 4px;
}

.gallery-image {
  width: 100%;
  height: auto;
  border-radius: 4px;
  margin: 10px 0;
}

.created-at {
  font-size: 0.8rem;
  color: #888;
  margin-top: 10px;
}

.gallery-loading, .gallery-error {
  text-align: center;
  padding: 40px;
  font-size: 1.2rem;
}

.gallery-error {
  color: #dc3545;
}

.media-section h3 {
  margin-top: 30px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
  color: #333;
}
```

## Important Notes

1. **Authentication Required**: All requests to the gallery endpoint must include a valid JWT token in the Authorization header.

2. **SAS URLs Expiration**: The SAS URLs provided in the response are valid for 1 hour. After that, you'll need to refresh the gallery data to get new URLs.

3. **Role Restrictions**: Only users with CREATOR or PRO roles can access the gallery endpoint.

4. **Content Retention**: The gallery only returns content created within the last 30 days.

5. **Error Handling**: Implement proper error handling for:
   - 401 Unauthorized (missing or invalid token)
   - 403 Forbidden (insufficient user role)
   - 500 Internal Server Error (server issues)

## Testing the Endpoint

You can test the endpoint using curl:

```bash
# Get all gallery items
curl -X GET "http://localhost:3001/api/gallery" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Get only images
curl -X GET "http://localhost:3001/api/gallery?type=image" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Get videos with pagination
curl -X GET "http://localhost:3001/api/gallery?type=video&page=1&limit=5" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```