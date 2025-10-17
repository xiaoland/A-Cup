from playwright.sync_api import sync_playwright, expect

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # 1. Sign up a new user
        page.goto("http://localhost:5173/signup")
        page.get_by_label("Username").fill("testuser")
        page.get_by_label("Password").fill("password")
        page.get_by_role("button", name="Sign Up").click()
        page.wait_for_url("http://localhost:5173/login")

        # 2. Log in
        page.goto("http://localhost:5173/login")
        page.get_by_label("Username").fill("testuser")
        page.get_by_label("Password").fill("password")
        page.get_by_role("button", name="Login").click()
        page.wait_for_url("http://localhost:5173/profiles")
        page.wait_for_load_state("networkidle")

        # 3. Create a new profile
        page.get_by_role("button", name="New Profile").click()
        page.get_by_label("Name").fill("Test Profile")
        page.get_by_role("button", name="Save").click()

        # 4. Verify the export button
        page.get_by_role("button", name="Export").first.click()

        # 5. Take a screenshot
        page.screenshot(path="jules-scratch/verification/verification.png")

        browser.close()

if __name__ == "__main__":
    run_verification()