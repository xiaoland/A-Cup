from playwright.sync_api import sync_playwright
import_users = [
    {
        "id": "c3a7a5d7-3b2d-4e2a-8f1c-6a7b8c9d0e1f",
        "username": "test",
        "password": "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08"
    }
]

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()
    page.goto("http://localhost:5173/user/login")
    page.locator('#username').fill("test")
    page.locator('#password input').fill("test")
    page.get_by_role("button", name="Login").click()
    page.wait_for_url("http://localhost:5173/")
    page.goto("http://localhost:5173/outbounds")
    page.get_by_role("button", name="New Outbound").click()
    page.screenshot(path="jules-scratch/verification/verification.png")
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
