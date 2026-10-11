# 🇳🇵 Halka Kaam (हल्का काम) — Test & Login Credentials

All test accounts use the standard Nepal mobile number format (`98XXXXXXXX`).

### 🔑 Passwords & Codes
- **Password:** **`123456`** *(or literally any password you type)*
- **OTP Code:** **`123456`** *(or any 6-digit code)*
- **1-Click:** Just click the **`⚡ 1-Click Login`** button to skip typing entirely!

---

## ⚡ Quick 1-Click Login

On the login screen (`/login` or via the top-right **"Join / Sign in"** button), there is an instant **`⚡ 1-Click Login`** button that logs directly into the **Kiran Bista** account with pre-verified Nepal KYC.

---

## 📋 Pre-Configured Test Accounts

| Name | Role | Phone Number | Demo OTP | Nepal KYC Status | Document Verified | Location |
|---|---|---|---|---|---|---|
| **Kiran Bista** | **Tasker / Worker** | `9801234567` | `123456` | **✅ Verified** | नेपाली नागरिकता (`27-01-78-04921`) | Pulchowk Campus, Lalitpur |
| **Pratiksha Sharma** | **Tasker / Worker** | `9804444444` | `123456` | **✅ Verified** | राष्ट्रिय परिचयपत्र (NID) | Patan Campus |
| **Roshan Tamang** | **Tasker / Worker** | `9805555555` | `123456` | **⚠️ Unverified** | *None (To test verification gate)* | TU Gate, Kirtipur |
| **Sunita Gurung** | **Job Poster / Host** | `9801111111` | `123456` | *No KYC needed to post* | — | Kirtipur |
| **Ramesh Karki** | **Job Poster / Host** | `9802222222` | `123456` | *No KYC needed to post* | — | Balkhu Chowk |
| **Anita Shrestha** | **Job Poster / Host** | `9803333333` | `123456` | *No KYC needed to post* | — | New Baneshwor, Kathmandu |

---

## 🧪 Testing Scenarios & User Flows

### 1. Apply for Jobs with KYC Verified Account
- **Login as:** `Kiran Bista` (`9801234567` / OTP: `123456` or click **`⚡ 1-Click Login`**)
- **Behavior:**
  - Browse available gigs on the feed.
  - Click on any open job (e.g., *Moving sofa in Kirtipur* or *Deliver package to Baneshwor*).
  - Click **"Make Offer"** — **Granted access immediately**.
  - Enter offer amount & pitch and submit.
  - Open **Profile** tab to view verified badge:
    `✓ नेपाल सरकार KYC प्रमाणित (Nepal KYC Verified) · नेपाली नागरिकता · Kathmandu`.

---

### 2. Test KYC Verification Gate with Unverified Account
- **Login as:** `Roshan Tamang` (`9805555555` / OTP: `123456`)
- **Behavior:**
  - Click on any open job.
  - See warning banner: **`🛡️ Nepal KYC Required to Apply (KYC प्रमाणीकरण आवश्यक)`**.
  - Button says **"Verify KYC & Apply"**.
  - Clicking it opens the **Nepal KYC Verification sheet**.
  - Click **`🪄 भरिदिनुहोस् (Fill Sample)`** to autofill sample Nepali citizenship details, or enter custom details and upload front/back photo cards.
  - Click **"प्रमाणित गर्नुहोस् (Verify & Continue)"** — account gets verified instantly and returns to the offer form!

---

### 3. Test Job Posting (Hosts / Posters)
- **Login as:** `Sunita Gurung` (`9801111111` / OTP: `123456`)
- **Behavior:**
  - Switch to **"Need Help" (Host mode)** from bottom navigation or profile.
  - Click **"Post a Job"** (`+`).
  - **No KYC required:** Post a gig with title, category, budget, and location.
  - Inspect offers received from workers in your inbox.

---

### 4. Create Your Own New Account
- Go to `/login` and switch to **"Create Account"**.
- Enter your name, any 10-digit number (e.g. `9841239876`), and neighborhood.
- Enter OTP: `123456`.
- Account starts as **Unverified** so you can go to **Profile ➔ Verify KYC** or apply to any gig to trigger verification.

---

## 🔑 Summary of Credentials

```json
{
  "otp_rule": "Any 6-digit number (Default: 123456)",
  "accounts": [
    {
      "name": "Kiran Bista",
      "phone": "9801234567",
      "otp": "123456",
      "role": "worker",
      "kyc": "verified",
      "notes": "1-click login available on login screen"
    },
    {
      "name": "Pratiksha Sharma",
      "phone": "9804444444",
      "otp": "123456",
      "role": "worker",
      "kyc": "verified",
      "notes": "CSIT tutor & tech repair worker"
    },
    {
      "name": "Roshan Tamang",
      "phone": "9805555555",
      "otp": "123456",
      "role": "worker",
      "kyc": "unverified",
      "notes": "Use this account to test the KYC verification gate and modal"
    },
    {
      "name": "Sunita Gurung",
      "phone": "9801111111",
      "otp": "123456",
      "role": "host",
      "kyc": "not_required",
      "notes": "Job poster in Kirtipur"
    },
    {
      "name": "Ramesh Karki",
      "phone": "9802222222",
      "otp": "123456",
      "role": "host",
      "kyc": "not_required",
      "notes": "Shop owner in Balkhu"
    },
    {
      "name": "Anita Shrestha",
      "phone": "9803333333",
      "otp": "123456",
      "role": "host",
      "kyc": "not_required",
      "notes": "Frequent delivery task poster"
    }
  ]
}
```

