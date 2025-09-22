# Prompt for Frontend Team: RealCulture AI Backend Integration

## Context

The frontend team is experiencing issues with endpoint integration with the RealCulture AI backend. The backend has been fully updated and is running successfully, but the frontend needs to be aligned with the correct API endpoints and integration patterns.

## Objective

Review and correctly integrate the frontend with all backend API endpoints to ensure proper functionality of the RealCulture AI application.

## Key Information

1. **Base URL**: `https://realculture-backend-g3b9deb2fja4b8a2.canadacentral-01.azurewebsites.net`
2. **Authentication**: JWT Bearer tokens required for most endpoints
3. **Status**: Backend is fully functional and running in production

## Deliverables

1. Review and update all frontend API calls to match the correct backend endpoints
2. Ensure proper authentication flow implementation
3. Implement error handling for all API responses
4. Update frontend components to match backend response structures
5. Test all user flows to ensure proper integration

## Resources

The complete integration guide with all endpoints and their specifications is available in:
`FRONTEND_INTEGRATION_GUIDE.md`

This document contains:
- All API endpoints with their methods, paths, and parameters
- Request and response formats for each endpoint
- Authentication requirements
- Error response formats
- Best practices for integration

## Specific Areas to Focus On

1. **Authentication Flow**:
   - User registration, login, and Google login
   - Token refresh and management
   - User profile retrieval

2. **Media Generation**:
   - Audio, video, image, and promotional image generation
   - Proper handling of signed URLs for media files
   - Credit management during generation

3. **User Management**:
   - Credit display and management
   - Plan upgrades
   - User profile updates

4. **Content Management**:
   - Gallery display with proper filtering
   - Content creation, retrieval, and deletion
   - Image and media management

5. **Error Handling**:
   - Proper display of error messages to users
   - Graceful handling of network errors
   - Authentication error recovery

## Integration Requirements

1. All API calls must include proper authentication headers
2. Request bodies must match the specified formats
3. Response handling must account for all possible response structures
4. Loading states should be implemented for all async operations
5. Error messages should be user-friendly and informative

## Testing

After integration, thoroughly test:
1. User authentication flows
2. Media generation workflows
3. Credit management
4. Content browsing and management
5. Error scenarios

## Timeline

Complete the integration and testing within 3 business days.

## Support

For any questions about the backend endpoints or response formats, refer to the integration guide or contact the backend team.