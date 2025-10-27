from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Log in
    page.goto("http://localhost:5173/user/login")
    page.get_by_label("Username").fill("testuser")
    page.get_by_label("Password").fill("testpassword")
    page.get_by_role("button", name="Login").click()

    # Navigate to Rule Sets page
    page.goto("http://localhost:5173/rulesets")

    # Wait for the table to be visible
    expect(page.get_by_role("table")).to_be_visible()

    # Take a screenshot
    page.screenshot(path="jules-scratch/verification/verification.png")

    browser.close()

with sync_playwright() as p:
    run(p)
