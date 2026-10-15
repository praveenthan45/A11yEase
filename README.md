# A11yEase

A complete React marketing website with eight routes, a branded 404, an isolated interactive accessibility demo and a reusable configurable contact form.

## Run locally

Requires Node.js 20.19+ or 22.12+ (Node 24 also works).

```sh
git clone https://github.com/praveenthan45/A11yEase.git
cd A11yEase
npm install
npm run dev
```

Open the local URL printed by Vite (normally http://127.0.0.1:5173).

```sh
npm run build
npm run preview
```

The production output is `dist/`. Configure the host to serve `index.html` for routes that do not correspond to physical assets. Vite handles route fallback during development and preview. Netlify fallback configuration is included; configure the equivalent SPA rewrite on other hosts. BrowserRouter requires this for directly opening `/features`, `/contact` and the other routes.

## Deploy on Render

For the existing Render **Web Service**, select the **Node** runtime and use these settings:

| Setting | Value |
| --- | --- |
| Branch | `main` |
| Root Directory | Leave empty |
| Build Command | `npm ci --include=dev && npm run build` |
| Start Command | `npm start` |

The build command explicitly installs Vite and the other build dependencies, including when `NODE_ENV=production` is set. The start command runs the installed `serve` production dependency against the existing `dist/` output. It reads Render's `PORT` environment variable, accepts connections on all interfaces, and serves `index.html` for client-side routes such as `/features` and `/contact`. No package download or Vite rebuild is needed at startup. Locally, its default port is 3000.

Keep the build command in **Build Command** only. If the deployment log says it is running `npm ci && npm run build` during startup, edit **Start Command** to `npm start`, save the settings, and redeploy the latest commit.

To test this production workflow locally:

```sh
npm ci --include=dev
npm run build
npm start
```

A Render **Static Site** can also serve this frontend. Use the same build command, set **Publish Directory** to `dist`, and add the rewrite `/*` → `/index.html`. Static Sites do not need a start command. The optional public environment variables below apply to either deployment type.

## Configuration

Copy `.env.example` to `.env.local` and set public build-time values:

```dotenv
VITE_CONTACT_API_URL=https://your-verified-service.example/contact
VITE_SUPPORT_EMAIL=your-verified-support-address
VITE_SITE_URL=https://your-real-site-origin
```

The example endpoint is illustrative: replace it with your real service. These values are bundled into the frontend. Never store a token, SMTP password or API secret in a `VITE_` variable. Restart Vite after changes; rebuild for production. No fake email, phone, office location, social profile, staff member, customer quote or compliance badge is included.

`src/config/site.js` centralizes site metadata and navigation. Add genuine social links to its `socials` array only after verification. Set the real site URL to enable absolute canonical and Open Graph URL/image metadata. The share image and favicon are original branded artwork.

## Contact API contract

The controlled form POSTs JSON with these keys:

```json
{
  "fullName": "Jamie Reader",
  "email": "jamie@example.com",
  "organization": "Optional organization",
  "inquiryType": "Product Demo",
  "subject": "A product demonstration",
  "message": "Please tell me about the product demonstration.",
  "consent": true,
  "website": "",
  "source": "a11yease-contact",
  "formDurationMs": 10000
}
```

Return a 2xx response only when the message is accepted. Return 429 for server rate limiting, and a suitable 4xx/5xx for rejection or failure. A 2xx acknowledgment does not prove an email arrived, so the UI says the service accepted the message. The UI includes associated validation errors, focus on the first error, an announced status, loading, failure and success states, a 15-second timeout, a honeypot, a minimum form duration and a 30-second interval between actual submission attempts. Failed submissions preserve the entered data.

The backend must enforce schema validation, length limits, allowed inquiry types, CSRF/origin protections appropriate to its authentication model, spam controls and server rate limiting. Allow the site’s origin through CORS if the endpoint is on another origin. Do not trust client timing, the honeypot or client-side validation. Keep mail credentials and routing logic server-side. Finalize recipient, retention, consent requirements and privacy information before enabling production submissions. With no endpoint, the form validates but explicitly reports that no message was sent.

## Demo behavior

The interactive demo changes only its sample. It implements text size, three exclusive themes, text spacing, link highlighting, a movable reading guide and mask, grayscale, OpenDyslexic, contained article zoom and redundant category labels. Adjustments live in React state. Previously saved main-panel preferences can still be restored from local browser storage; Reset restores defaults and clears them. No account or cloud synchronization is involved. The reading mask does not hide text from screen readers. No claim of universal effectiveness, assistive-technology replacement, full compliance or compatibility with arbitrary websites is made. Static product compositions are marked as illustrative.

## Accessibility and verification

Semantic landmarks, a skip link, route focus management, active navigation, Escape-close mobile navigation, labeled controls, visible focus, accessible FAQ buttons, form errors, reduced-motion styles and responsive reflow are included. The source aims toward WCAG 2.2 AA; automated checks are not a certification or substitute for assistive-technology and user testing.

Start the dev server and run `npm run verify` for the browser suite. It checks all nine routes at 1440, 1024, 768, 480 and 360 pixels, automated WCAG checks on desktop/mobile, overflow, core demo controls, reset, FAQ search, mobile navigation, route focus, skip navigation and form validation. The suite uses installed Chrome on Windows by default; set `QA_BROWSER_PATH` for another Chromium executable, and `QA_BASE_URL` for another local server. Screenshots and reports go into ignored `qa/`.

To verify configured API handling, start a separate dev server with `VITE_CONTACT_API_URL=https://contact.example.test/api`, then run the suite with `QA_BASE_URL` pointing at that server and `QA_CONFIGURED_CONTACT=1`. The test intercepts requests locally to verify loading, failure, payload and success behavior. No real email is sent.

## Before commercial launch

The privacy and terms pages are deliberately marked legal-review drafts. Replace review markers with verified legal/operator information and have qualified counsel finalize them. Supply the real contact service, verified support email and production origin. Verify the infrastructure’s logging and privacy behavior, test the specific product environments you support and perform manual screen-reader testing. Do not turn the illustrative mockups into claims about unverified product deployment.

See `ASSETS.md` for third-party image, font and package references.

## Category catalog from the supplied workbook

The category catalog is transcribed from `53 Accessibility Settings - Category Wise.xlsx`. The workbook contains 52 filled settings across 9 categories; serial number 30 is blank and is not invented. The workbook is read only and is not modified. `src/data/accessibility-settings.json` preserves its setting names, categories and source serial numbers. Descriptions, implementation status and category visuals are authored separately.

The Features page displays all listed settings grouped by category, with category-specific illustrations and direct category links. The home page retains its original visual feature highlights and nine-category overview. Both pages include the main visual and reading demo. The separate nine-category sample section and its component have been removed from the project. Browser-dependent and integration-dependent capabilities remain labeled in the catalog; hardware and assistive-technology compatibility is not asserted by a visual example.

Previously saved main-panel preferences under a11yease-demo-preferences-v1 or the former brand key are allowlisted and validated when loaded. Reset removes them. The current demo has no save action. Privacy and FAQ copy describe this behavior.

Run `npm run verify:categories` with the local preview running to verify catalog reconciliation, category links, removal of the category-sample sections, the main demo, responsive layouts and automated accessibility checks.

## Feature stories and motion checks

All 52 catalog settings have authored context examples in `src/data/featureExamples.js`. Integration and compatibility review entries describe what still needs verification. The home page adds three interactive feature stories with a default/adjusted comparison. Five page-specific CTA compositions use native HTML/CSS instead of repeated decorative imagery.

Card entrances run once as they enter view; hover movement is limited to fine pointers. Focused content appears immediately, and system reduced-motion preferences suppress these effects, including when changed during a visit.

With the dev server running, `npm run verify:polish` checks the new comparisons, keyboard paths, focus visibility, reduced motion, catalog card entrances and CTA reflow. Set `QA_BASE_URL` when the server uses a port other than 5173.

The Home and Features pages include the main visual/reading demo without the “A Sample for Every Perspective” category-sample section. The catalog’s demo link opens the main Features preview.
