from playwright.sync_api import sync_playwright
import time

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    context.add_init_script("window.localStorage.setItem('token', 'dummy-token');")
    page = context.new_page()

    page.goto("http://localhost:5173/profiles/new")
    page.wait_for_selector('h1:has-text("Create Profile")')

    # Fill in the profile name
    page.fill('input[type="text"]', 'Test Profile')

    # Take a screenshot
    page.screenshot(path="jules-scratch/verification/verification.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
