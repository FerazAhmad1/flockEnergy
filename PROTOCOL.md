# PROTOCOL.md

## How the portal works

I visited the Urja Meter Ops website and observed the requests made by the browser using the Network tab in DevTools.

### 1. Login and authentication

When I logged in, the website made a `POST /login` request. After that, it requested `/meters/__data.json`, followed by the meter list API.

The login response sets a session cookie. Subsequent authenticated requests use this cookie in the `Cookie` header.

### 2. Meter list and search

The website calls these APIs to retrieve meter data:

- `GET /portal/meters/search?q=&page=1`

The meter search API returns paginated meter records. The request includes the following relevant headers:

- `Cookie`: contains the session cookie received during login.
- `x-sveltekit-action: true`: observed on the login form request, not confirmed as required for the meter list API.

I entered a meter ID from the list into the search box and got the specific meter. I also tested searching by serial number, and that worked too. So the search supports both meter ID and serial number.

### 3. Energy consumption

The meter ID in the list is clickable. When I clicked it, the browser requested:

`GET /portal/meters/{meterId}/energy`

This endpoint returns JSON containing timestamped energy readings, including kWh, kVAh, and voltage.

### 4. Geographic data

The meter detail page also requests:

`GET /portal/meters/{meterId}/geo`

This returns the meter's latitude and longitude.

### 5. Transformers and meter export

The website has a separate Transformers tab that lists transformers using:

`GET /portal/dts?page=1`

There is also a button that downloads all meter data as a JSON file. I observed this download using:

`GET /portal/export?page=1`

The downloaded data includes meter details, network hierarchy, and geographic information.

### Notes

- The portal uses session-cookie authentication.
- Meter search supports both meter ID and serial number.
- Meter details, geographic data, and energy readings are retrieved through separate requests.
- The search and transformer APIs are paginated.
- The energy endpoint returns timestamped readings; the observed data covered seven days at 30-minute intervals.
