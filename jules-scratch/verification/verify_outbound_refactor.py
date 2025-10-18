from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Navigate to the create outbound page
    page.goto("http://localhost:5173/outbounds/create")
    page.wait_for_url("http://localhost:5173/outbounds/create")

    # Wait for the editor to appear
    expect(page.get_by_text("Outbound Editor")).to_be_visible()

    # Take a screenshot
    page.screenshot(path="jules-scratch/verification/verification.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)