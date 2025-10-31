import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import ImportDnsServer from "./importDnsServer.vue";
import PrimeVue from "primevue/config";

describe("importDnsServer.vue", () => {
  const mountComponent = () =>
    mount(ImportDnsServer, {
      props: {
        visible: true,
      },
      global: {
        plugins: [PrimeVue],
        stubs: {
          Dialog: {
            template:
              '<div v-if="visible"><slot /><slot name="footer" /></div>',
            props: ["visible"],
          },
        },
      },
    });

  it("renders correctly when visible", () => {
    const wrapper = mountComponent();
    expect(wrapper.find("textarea").exists()).toBe(true);
  });

  it("emits parsed event with valid DNS server JSON", async () => {
    const wrapper = mountComponent();
    const validDnsServer = JSON.stringify({
      tag: "google-dns",
      type: "udp",
      address: "8.8.8.8",
    });

    await wrapper.find("textarea").setValue(validDnsServer);
    await wrapper.find('button[aria-label="Confirm"]').trigger("click");

    const emitted = wrapper.emitted("parsed");
    expect(emitted).toBeTruthy();
    expect(emitted![0][0]).toMatchObject({
      tag: "google-dns",
      type: "udp",
      address: "8.8.8.8",
    });
  });

  it("shows error message for invalid JSON", async () => {
    const wrapper = mountComponent();
    const invalidJson = "not valid json";

    await wrapper.find("textarea").setValue(invalidJson);
    await wrapper.find('button[aria-label="Confirm"]').trigger("click");

    expect(wrapper.find(".p-error").exists()).toBe(true);
    expect(wrapper.emitted("parsed")).toBeFalsy();
  });

  it("shows error message for invalid DNS server schema", async () => {
    const wrapper = mountComponent();
    const invalidServer = JSON.stringify({
      tag: "invalid",
      // missing required type field
    });

    await wrapper.find("textarea").setValue(invalidServer);
    await wrapper.find('button[aria-label="Confirm"]').trigger("click");

    expect(wrapper.find(".p-error").exists()).toBe(true);
    expect(wrapper.emitted("parsed")).toBeFalsy();
  });

  it("validates TLS DNS server with all required fields", async () => {
    const wrapper = mountComponent();
    const tlsServer = JSON.stringify({
      tag: "cloudflare-tls",
      type: "tls",
      server: "1.1.1.1",
      server_port: 853,
      tls: {
        enabled: true,
      },
    });

    await wrapper.find("textarea").setValue(tlsServer);
    await wrapper.find('button[aria-label="Confirm"]').trigger("click");

    const emitted = wrapper.emitted("parsed");
    expect(emitted).toBeTruthy();
    expect(emitted![0][0]).toMatchObject({
      tag: "cloudflare-tls",
      type: "tls",
      server: "1.1.1.1",
      server_port: 853,
    });
  });

  it("validates HTTPS DNS server", async () => {
    const wrapper = mountComponent();
    const httpsServer = JSON.stringify({
      tag: "google-https",
      type: "https",
      server: "dns.google",
      server_port: 443,
      path: "/dns-query",
      tls: {
        enabled: true,
      },
    });

    await wrapper.find("textarea").setValue(httpsServer);
    await wrapper.find('button[aria-label="Confirm"]').trigger("click");

    const emitted = wrapper.emitted("parsed");
    expect(emitted).toBeTruthy();
    expect(emitted![0][0]).toMatchObject({
      tag: "google-https",
      type: "https",
      server: "dns.google",
      server_port: 443,
      path: "/dns-query",
    });
  });

  it("clears error on hide", async () => {
    const wrapper = mountComponent();
    await wrapper.find("textarea").setValue("invalid");
    await wrapper.find('button[aria-label="Confirm"]').trigger("click");

    expect(wrapper.find(".p-error").exists()).toBe(true);

    await wrapper.find('button[aria-label="Cancel"]').trigger("click");

    expect(wrapper.emitted("update:visible")).toBeTruthy();
  });

  it("clears input after successful import", async () => {
    const wrapper = mountComponent();
    const validDnsServer = JSON.stringify({
      tag: "test-dns",
      type: "udp",
      address: "8.8.8.8",
    });

    await wrapper.find("textarea").setValue(validDnsServer);
    await wrapper.find('button[aria-label="Confirm"]').trigger("click");

    expect(wrapper.emitted("parsed")).toBeTruthy();
    expect(wrapper.emitted("update:visible")).toBeTruthy();
  });
});
