import { defineConfig, devices } from "@playwright/test";

const PORT = 3300;
const env = {
  NEXT_PUBLIC_SITE_URL: `http://localhost:${PORT}`,
  NEXT_PUBLIC_AGENCY_NAME: "Test Agency",
  // Email is pointed at a local mock so the success path can be exercised without a real provider.
  RESEND_API_KEY: "test-key",
  CONTACT_FROM_EMAIL: "site@test.example",
  CONTACT_TO_EMAIL: "inbox@test.example",
  RESEND_API_URL: "http://localhost:4020/emails",
  PORT: String(PORT),
  // AI is pointed at a local mock so every feature runs without a real key. AUDIT_ALLOW_PRIVATE lets the audit read the local mock site.
  GEMINI_API_KEY: "test-gemini-key",
  AI_BASE_URL: "http://localhost:4030/v1beta",
  AUDIT_ALLOW_PRIVATE: "1",
  AI_LEAD_SUMMARY: "1",
  AI_RATE_SCALE: "100",
  FORM_RATE_SCALE: "100",
  AI_DAILY_LIMIT: "5000",
};

export default defineConfig({
  testDir: "tests/e2e",
  testMatch: /.*\.spec\.ts/,
  workers: 1,
  reporter: [["list"]],
  use: { baseURL: `http://localhost:${PORT}`, trace: "retain-on-failure" },
  webServer: [
    { command: "node tests/e2e/mock-resend.mjs", url: "http://localhost:4020/last", reuseExistingServer: false },
    { command: "node tests/e2e/mock-gemini.mjs", url: "http://localhost:4030/last", reuseExistingServer: false },
    { command: "npm run build && npm run start", url: `http://localhost:${PORT}`, timeout: 300_000, reuseExistingServer: false, env },
  ],
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "mobile", use: { ...devices["Pixel 7"], viewport: { width: 390, height: 844 } } },
  ],
});
