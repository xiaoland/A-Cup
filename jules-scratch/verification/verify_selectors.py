from playwright.sync_api import sync_playwright, expect

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto("http://localhost:5173")

    # Login
    page.get_by_label("Username").fill("test")
    page.get_by_label("Password").fill("test")
    page.get_by_role("button", name="Login").click()
    page.screenshot(path="jules-scratch/verification/after_login.png")

    # Go to profiles page
    page.get_by_role("link", name="Profiles").click()

    # Edit a profile
    page.get_by_role("button", name="Edit").first.click()

    # Click on route editor
    page.get_by_text("Route").first.click()

    # Take screenshot
    page.screenshot(path="jules-scratch/verification/verification.png")

    browser.close()