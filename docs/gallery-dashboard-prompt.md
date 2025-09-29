# Gallery Dashboard Integration Prompt

## Overview
This document provides implementation guidance for creating a dashboard card that links to the gallery and implementing the gallery display functionality in the frontend application.

## Dashboard Card Implementation

### React Component Example

```jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardCard.css'; // Optional CSS file for styling

const DashboardCard = ({ title, description, icon, onClick, itemCount }) => {
  return (
    <div className="dashboard-card" onClick={onClick}>
      <div className="card-icon">{icon}</div>
      <div className="card-content">
        <h3>{title}</h3>
        <p>{description}</p>
        {itemCount !== undefined && (
          <span className="item-count">{itemCount} items</span>
        )}
      </div>
    </div>
  );
};

// Gallery Dashboard Card Component
const GalleryDashboardCard = ({ token, onNavigateToGallery }) => {
  const [mediaCount, setMediaCount] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const navigate = useNavigate();

  React.useEffect(() => {
    fetchMediaCount();
  }, []);

  const fetchMediaCount = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/gallery', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch gallery');
      }

      const data = await response.json();
      setMediaCount(data.length);
    } catch (error) {
      console.error('Error fetching media count:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = () => {
    if (onNavigateToGallery) {
      onNavigateToGallery();
    } else {
      navigate('/gallery');
    }
  };

  return (
    <DashboardCard
      title="Media Gallery"
      description="View all your generated content"
      icon={loading ? "🔄" : "🖼️"}
      onClick={handleCardClick}
      itemCount={loading ? "Loading..." : mediaCount}
    />
  );
};

export default GalleryDashboardCard;
```

### CSS Styling for Dashboard Card

```css
/* DashboardCard.css */
.dashboard-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  width: 250px;
  height: 200px;
  justify-content: center;
}

.dashboard-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  border-color: #007bff;
}

.card-icon {
  font-size: 2rem;
  margin-bottom: 15px;
}

.card-content {
  text-align: center;
}

.card-content h3 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 1.2rem;
}

.card-content p {
  margin: 0 0 10px 0;
  color: #666;
  font-size: 0.9rem;
}

.item-count {
  background-color: #007bff;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
}
```

### Dashboard Integration Example

```jsx
import React from 'react';
import GalleryDashboardCard from './GalleryDashboardCard';

const Dashboard = ({ authToken }) => {
  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <div className="dashboard-cards">
        <GalleryDashboardCard token={authToken} />
        {/* Other dashboard cards can go here */}
      </div>
    </div>
  );
};

export default Dashboard;
```

## Gallery Display Implementation

### React Gallery Component

```jsx
import React, { useState, useEffect } from 'react';
import './Gallery.css'; // Optional CSS file for styling

const GalleryComponent = ({ token }) => {
  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  
  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:3001/api/gallery', {
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
  
  const filteredItems = filter === 'all' 
    ? mediaItems 
    : mediaItems.filter(item => item.type === filter);
  
  const groupedItems = filteredItems.reduce((groups, item) => {
    const type = item.type;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(item);
    return groups;
  }, {});
  
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

### CSS Styling for Gallery

```css
/* Gallery.css */
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

.dashboard-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
}
```

## API Integration Details

### Gallery Endpoint
The gallery is accessed through the `/api/gallery` endpoint which requires authentication:

```javascript
// Fetch gallery data
const fetchGallery = async (token) => {
  const response = await fetch('http://localhost:3001/api/gallery', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
};
```

### Response Format
The gallery endpoint returns an array of media items with the following structure:

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

## Implementation Notes

1. **Authentication**: Ensure the user is authenticated and has a valid JWT token before accessing the gallery
2. **Error Handling**: Implement proper error handling for network issues and API errors
3. **Loading States**: Show loading indicators while fetching data
4. **Responsive Design**: Ensure the gallery layout works well on different screen sizes
5. **Performance**: Consider implementing pagination for large galleries
6. **Security**: Never expose tokens in client-side code or logs

## Usage Example

To integrate the gallery into your application:

1. Add the dashboard card to your main dashboard
2. Create a dedicated gallery page/route
3. Import and use the GalleryComponent on the gallery page
4. Pass the authentication token as a prop to both components

```jsx
// App.js or routing component
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import GalleryPage from './components/GalleryPage';

function App() {
  const [authToken, setAuthToken] = useState(null);
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard authToken={authToken} />} />
        <Route path="/gallery" element={<GalleryPage authToken={authToken} />} />
      </Routes>
    </Router>
  );
}
```