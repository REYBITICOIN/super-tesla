import { describe, it, expect, beforeAll } from "vitest";

describe("Facebook Credentials Validation", () => {
  let appId: string;
  let appSecret: string;
  let businessId: string;

  beforeAll(() => {
    appId = process.env.FACEBOOK_APP_ID || "";
    appSecret = process.env.FACEBOOK_APP_SECRET || "";
    businessId = process.env.FACEBOOK_BUSINESS_ID || "";
  });

  it("should have FACEBOOK_APP_ID configured", () => {
    expect(appId).toBeTruthy();
    expect(appId).toBe("726728966722463");
  });

  it("should have FACEBOOK_APP_SECRET configured", () => {
    expect(appSecret).toBeTruthy();
    expect(appSecret.length).toBeGreaterThan(20);
  });

  it("should have FACEBOOK_BUSINESS_ID configured", () => {
    expect(businessId).toBeTruthy();
    expect(businessId).toBe("1683799616351334");
  });

  it("should validate App ID format", () => {
    expect(appId).toMatch(/^\d+$/);
  });

  it("should validate App Secret format", () => {
    expect(appSecret).toMatch(/^[a-f0-9]+$/i);
  });

  it("should validate Business ID format", () => {
    expect(businessId).toBeTruthy();
    expect(businessId).toMatch(/^\d+$/);
  });

  it("should construct valid Facebook Graph API URL", () => {
    const graphUrl = `https://graph.facebook.com/v18.0/${appId}`;
    expect(graphUrl).toContain("graph.facebook.com");
    expect(graphUrl).toContain(appId);
  });

  it("should have all required credentials for OAuth flow", () => {
    expect(appId).toBeTruthy();
    expect(appSecret).toBeTruthy();
    expect(businessId).toBeTruthy();
  });
});
