# Profile Edit Mode Improvements

## Overview
Added support for fetching full profile data in `CreateProfile` format via a new `mode` query parameter on the `GET /api/profiles/:id` endpoint.

## Changes

### Backend Changes

#### 1. API Endpoint Enhancement (`server/apis/profile.ts`)
- Added `mode` query parameter support to `GET /api/profiles/:id` endpoint
- When `mode=edit` is specified, the endpoint now:
  - Fetches profile metadata from the database
  - Retrieves the full SingBox configuration from R2 storage
  - Combines both sources to return data in `CreateProfile` format
  - Includes: `outbounds`, `route`, `dns`, `inbounds` from R2
  - Includes: `name`, `tags`, `referencedOutbounds`, `referencedRuleSets` from database
- Without `mode` parameter, returns normal `Profile` format (backward compatible)

#### 2. API Tests (`server/apis/profile.test.ts`)
- Added new test case: `"should get a profile in edit mode"`
- Verifies that `mode=edit` returns all required fields for editing
- Mocked R2 storage to return sample SingBox profile data

### Frontend Changes

#### 1. Profile Store (`src/stores/profile.ts`)
- Added new method: `getProfileForEdit(id: string)`
- Uses query parameter `?mode=edit` to fetch full profile data
- Returns `CreateProfile` type for seamless integration with profile editor

#### 2. Edit Profile View (`src/views/editProfile.vue`)
- Updated to use `profileStore.getProfileForEdit()` instead of `getProfile()`
- Removed the simplified transformation logic (no longer needed)
- Profile editor now receives complete data directly from the API
- Eliminates the previous workaround with empty arrays for outbounds, route, dns, and inbounds

### Documentation

#### OpenAPI Specification (`openapi/profile.yaml`)
- Added `mode` query parameter documentation to `GET /api/profiles/{id}`
- Parameter type: `string`, enum: `['edit']`
- Response schema updated to support `oneOf` (Profile or CreateProfile)
- Added description explaining when to use `mode=edit`

## Benefits

1. **Eliminates Data Loss**: Previously, editing a profile would lose the full configuration stored in R2
2. **Proper Separation of Concerns**: Database stores metadata, R2 stores full configuration
3. **Backward Compatibility**: Existing API consumers continue to work without changes
4. **Cleaner Code**: Removed hacky transformation logic from the frontend
5. **Type Safety**: Full end-to-end type safety with `CreateProfile` schema

## API Usage Examples

### Get Profile (Normal Mode)
```http
GET /api/profiles/{id}
Authorization: Bearer <token>
```
Returns: Profile (id, name, tags, createdBy, outbounds array, rule_sets array)

### Get Profile (Edit Mode)
```http
GET /api/profiles/{id}?mode=edit
Authorization: Bearer <token>
```
Returns: CreateProfile (name, tags, referencedOutbounds, referencedRuleSets, outbounds, route, dns, inbounds)

## Testing
All tests pass successfully:
- ✓ Backend API tests (15 tests passed)
- ✓ New edit mode test validates full response structure
- ✓ No breaking changes to existing tests