from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Bypass JWT authentication
    page.goto("http://localhost:5174/")
    page.evaluate("() => localStorage.setItem('token', 'dummy-token')")

    page.goto("http://localhost:5174/profiles")
    page.reload()
    page.wait_for_selector('text="Profiles"', timeout=60000) # Wait for page to load

    # Check if any profiles exist
    edit_buttons = page.get_by_role("link", name="Edit").all()
    if not edit_buttons:
        page.get_by_role("button", name="New Profile").click()
        page.wait_for_url("http://localhost:5174/profiles/new")
        # There is no name field, just save
        page.get_by_role("button", name="Save").click()
        page.wait_for_url("http://localhost:5174/profiles")
        page.wait_for_selector('text="Profiles"', timeout=60000) # Wait for page to load

    page.get_by_role("link", name="Edit").first.click()
    page.wait_for_url(lambda url: "profiles/edit" in url)

    # Click the "Add Rule Set" button
    page.get_by_role("button", name="Add Rule Set").click()

    # Select a rule set from the picker
    page.get_by_role('combobox').click()
    page.get_by_role('option', name='DNS Block').click()

    page.screenshot(path="jules-scratch/verification/verification.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
