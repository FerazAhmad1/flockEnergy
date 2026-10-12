# Flock Energy — Urja Meter Ops API

## Overview

This project provides a backend API over the existing Urja Meter Ops portal. The goal is to expose meter and transformer data through simple APIs instead of making consumers directly depend on the portal's endpoints.

I have implemented meter search, meter details, energy readings, meter location and transformer listing using Node.js, Express and TypeScript.

## Features

- Search meters by meter ID or serial number.
- Get meter details by meter ID.
- Fetch energy readings for a meter.
- Fetch meter latitude and longitude.
- List transformers with pagination.
- Handle portal login and reuse the session cookie across requests.
- Keep the portal integration separate from the application services.

## Project Structure

```text
src/
├── controllers/
│   ├── meter.controller.ts
│   ├── energy.controller.ts
│   └── transformer.controller.ts
├── integrations/
│   └── urja/
│       ├── portal-client.interface.ts
│       ├── urja-portal.service.ts
│       └── urja.types.ts
├── routes/
│   ├── meter.route.ts
│   ├── energy.route.ts
│   └── transformer.route.ts
├── services/
│   ├── meter.service.ts
│   ├── energy.service.ts
│   └── transformer.service.ts
├── app.ts
├── config.ts
└── server.ts

.env
.gitignore
LICENSE
openapi.json
PROTOCOL.md
README.md
package.json
tsconfig.json
```

Controllers handle HTTP requests and responses. Services handle the application operations, while `integrations/urja` contains the portal-specific API calls, authentication and response types.

The application services depend on the `PortalClient` interface, which keeps them separate from the actual portal implementation.

## Setup

### Requirements

- Node.js 20 or later
- npm
- Access to the Urja Meter Ops portal

### Install dependencies

```bash
npm install
```

### Environment variables

Create a `.env` file in the project root:

```env
PORT=3005
URJA_BASE_URL=https://urja-ops.flockenergy.tech
URJA_USERNAME=your_portal_email
URJA_PASSWORD=your_portal_password
```

Use your own portal credentials. The variable names must match the ones used in `config.ts`.

Make sure `.env` is included in `.gitignore` and never commit credentials to GitHub.

### Run the application

```bash
npm run dev
```

The server runs at:

`http://localhost:3005`

## API Endpoints

All current endpoints use the `GET` method.

| Endpoint                       | Description           |
| ------------------------------ | --------------------- |
| `/api/meters?q=J100012&page=1` | Search or list meters |
| `/api/meters/:meterId`         | Get meter details     |
| `/api/meters/:meterId/energy`  | Get energy readings   |
| `/api/meters/:meterId/geo`     | Get meter coordinates |
| `/api/transformers?page=1`     | List transformers     |

### Sample requests

Search for a meter:

```bash
curl "http://localhost:3005/api/meters?q=J100012&page=1"
```

Search using a serial number:

```bash
curl "http://localhost:3005/api/meters?q=HP85710&page=1"
```

Get meter details:

```bash
curl "http://localhost:3005/api/meters/J100012"
```

Get energy readings:

```bash
curl "http://localhost:3005/api/meters/J100012/energy"
```

Get meter location:

```bash
curl "http://localhost:3005/api/meters/J100012/geo"
```

List transformers:

```bash
curl "http://localhost:3005/api/transformers?page=1"
```

The backend handles authentication with the Urja portal, so callers do not need to manage the portal session themselves.

## Authentication

The portal uses cookie-based session authentication.

When a request requires portal access, the integration checks whether a session is available. If login is required, it sends the login form, extracts the session cookie and stores it in memory.

Subsequent requests reuse the cookie. If multiple requests arrive while login is in progress, they can wait for the same login operation instead of sending duplicate login requests.

The session is kept in memory for simplicity. A new login is required when the locally tracked session is close to expiry or the portal rejects it.

## Assumptions

- The Urja portal is the source of truth for meter and transformer data.
- Meter IDs and serial numbers can both be used to search for meters.
- The portal controls the available fields, pagination and energy-reading time range.
- Some meter metadata and hierarchy fields may be missing from portal responses.
- Energy readings are returned in the portal's format; cumulative readings should not be treated as interval consumption without further processing.
- The current implementation fetches data from the portal when needed rather than maintaining a separate copy of the dataset.

## Design Decisions and Trade-offs

### Keep the integration separate

Portal-specific authentication and HTTP calls are kept inside `integrations/urja`. This avoids spreading portal-specific details across the application.

### Use a portal client interface

The application services depend on `PortalClient` rather than directly depending on `UrjaPortalService`. This makes the services easier to test with a mock client and leaves room for another implementation later.

### Reuse the session cookie

A shared portal service is used by the meter, energy and transformer services. This avoids logging in separately for every request.

### Keep session state in memory

For this assignment, an in-memory session is sufficient and keeps the implementation simple. It would need to be reconsidered if the application ran across multiple instances.

### Use the existing portal APIs

I have not added a database or copied the portal's data into a new store. The backend currently acts as an API layer over the existing portal, which reduces implementation complexity but means that response times and availability depend on the portal.

## What I Would Improve With More Time

One area I would explore next is making better use of the meter data already available from the portal.

Instead of fetching everything on demand, I could experiment with collecting meter metadata and energy readings, storing the data and processing it for more useful queries.

For example:

- Filter meters by zone, circle, division or substation.
- Find meters by status, such as faulty, installed or decommissioned.
- Filter meters by make, phase or transformer.
- Calculate energy consumption for a particular transformer or zone over a selected time period.
- Compare energy usage across transformers or zones.

For this, I would first inspect which fields and historical readings are available and how frequently the data changes. I could then use a database for the collected data and Redis for frequently accessed results or indexes where it makes sense.

Other improvements would include:

- Add unit and integration tests for the portal client, services and controllers.
- Improve error handling and distinguish authentication errors from permission errors.
- Add request validation and structured logging.
- Verify the portal's pagination limits and energy-reading time range.
- Add controlled retries and timeouts for transient failures.
- Add caching only after understanding the data freshness requirements.

I have intentionally kept the current implementation small instead of adding a database, caching layer or background jobs before they are needed.

## Documentation

- [PROTOCOL.md](./PROTOCOL.md) — observed portal endpoints, authentication flow and response details.
- [openapi.json](./openapi.json) — OpenAPI specification for the backend API.

## Conclusion

The current implementation provides a small backend layer over the Urja portal with a clear separation between routes, controllers, services and the external integration.

The next step would be to explore the available data and build useful filtering and energy-consumption queries on top of it, while keeping the implementation simple and adding complexity only when required.
