from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()

    # Bypass auth by setting token in local storage
    context.add_init_script("window.localStorage.setItem('token', 'dummy-token');")

    page = context.new_page()

    # Go directly to the edit page for a new profile
    page.goto("http://localhost:5173/profiles/edit/new")
    page.wait_for_selector('button:has-text("Outbounds")')


    page.screenshot(path="jules-scratch/verification/verification.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
