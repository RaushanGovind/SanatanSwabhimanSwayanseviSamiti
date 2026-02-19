# Family Registration Verification Workflow - Complete Guide

## ✅ Correct Workflow (Updated)

```
Application Submitted
        ↓
1. PRESIDENT SCRUTINY (President receives first)
        ↓
2. SECRETARY SCRUTINY (Secretary assigns coordinator)
        ↓
3. COORDINATOR SCRUTINY (Assigned coordinator verifies)
        ↓
4. PRESIDENT APPROVAL (President gives final approval)
        ↓
   APPROVED ✅
```

---

## 📋 Step-by-Step Testing Guide

### **Test Family Created:**
- **Name:** Test Family Head
- **ID:** 698bdeefe298503f7c3adfff
- **Initial Stage:** President Scrutiny
- **Status:** Pending

---

### **Step 1: President Scrutiny**

**Who Can Act:** President, Vice President, Admin

**What to Do:**
1. Login as **President** (Rajesh Kumar)
2. Go to **Registration Desk** tab
3. You should see "Test Family Head" at "President Scrutiny" stage
4. In ACTION CENTER column, you'll see: **"✓ Verify & Forward"** button
5. Click the button
6. Enter optional remarks
7. Application moves to **Secretary Scrutiny**

**Expected Result:**
- Stage changes from "President Scrutiny" → "Secretary Scrutiny"
- Button disappears for President
- Secretary can now see the application

---

### **Step 2: Secretary Scrutiny (Coordinator Assignment)**

**Who Can Act:** Secretary, Admin

**What to Do:**
1. Login as **Secretary** (Amit Sharma)
2. Go to **Registration Desk** tab
3. You should see "Test Family Head" at "Secretary Scrutiny" stage
4. In ACTION CENTER column, you'll see:
   - **Orange Dropdown:** "📌 Assign Coordinator"
   - **Button:** "✓ Verify & Forward" (DISABLED until coordinator assigned)

5. **Select a coordinator** from the dropdown
6. Coordinator gets assigned automatically
7. Now click **"✓ Verify & Forward"**
8. Application moves to **Coordinator Scrutiny**

**Expected Result:**
- Coordinator name appears in COORDINATOR column
- Stage changes from "Secretary Scrutiny" → "Coordinator Scrutiny"
- Assigned coordinator can now see the application

---

### **Step 3: Coordinator Scrutiny**

**Who Can Act:** Assigned Coordinator only, Admin

**What to Do:**
1. Login as the **Assigned Coordinator**
2. Go to **Registration Desk** tab
3. You should see "Test Family Head" at "Coordinator Scrutiny" stage
4. COORDINATOR column shows your name
5. In ACTION CENTER column, you'll see: **"✓ Verify & Forward"** button
6. Click the button
7. Enter optional remarks
8. Application moves to **President Approval**

**Expected Result:**
- Stage changes from "Coordinator Scrutiny" → "President Approval"
- Application goes back to President for final approval

---

### **Step 4: President Approval (Final)**

**Who Can Act:** President, Vice President, Admin

**What to Do:**
1. Login as **President** (Rajesh Kumar)
2. Go to **Registration Desk** tab
3. You should see "Test Family Head" at "President Approval" stage
4. In ACTION CENTER column, you'll see: **"✅ Final Approval"** button (GREEN)
5. Click the button
6. Confirm the approval
7. **User account is created** for the Family Head
8. Application status changes to **"Approved"**

**Expected Result:**
- Status changes from "Pending" → "Approved"
- Stage shows "Active Member"
- Family Head can now login with their credentials
- Family disappears from pending list

---

## 🔒 Permission Matrix

| Stage | President | Secretary | Coordinator | Admin |
|-------|-----------|-----------|-------------|-------|
| President Scrutiny | ✅ Verify | ❌ | ❌ | ✅ Override |
| Secretary Scrutiny | ❌ | ✅ Assign & Verify | ❌ | ✅ Override |
| Coordinator Scrutiny | ❌ | ❌ | ✅ Verify (if assigned) | ✅ Override |
| President Approval | ✅ Final Approve | ❌ | ❌ | ✅ Override |

---

## ⚠️ Important Rules

1. **Coordinator MUST be assigned** at Secretary Scrutiny before forwarding
2. **Only assigned coordinator** can verify at Coordinator Scrutiny
3. **President is first receiver** and **final approver**
4. **Secretary handles coordinator assignment** in the middle
5. **Admin can override** at any stage

---

## 🐛 Common Issues & Fixes

### Issue: "Application at Coordinator Scrutiny but no coordinator assigned"
**Cause:** Old data from previous workflow
**Fix:** Run `python fix_verification_stages.py` to reset to Secretary Scrutiny

### Issue: "Can't see Verify button"
**Cause:** Wrong user role or stage mismatch
**Fix:** Check you're logged in with correct role for that stage

### Issue: "Coordinator dropdown not showing"
**Cause:** Not at Secretary Scrutiny stage or not logged in as Secretary
**Fix:** Ensure application is at Secretary Scrutiny and you're logged in as Secretary

---

## 📊 Database Structure

Each family document has:
```json
{
  "status": "Pending" | "Approved",
  "verification_stage": "President Scrutiny" | "Secretary Scrutiny" | "Coordinator Scrutiny" | "President Approval",
  "coordinator_id": "user_id_here" | null,
  "coordinator_name": "Name Here" | null,
  "remarks": [
    {
      "stage": "President Scrutiny",
      "remark": "Looks good",
      "by": "Rajesh Kumar",
      "role": "president",
      "date": "2026-02-11T..."
    }
  ]
}
```

---

## 🎯 Test Checklist

- [ ] President can verify at President Scrutiny
- [ ] Secretary sees coordinator dropdown at Secretary Scrutiny
- [ ] Secretary cannot forward without assigning coordinator
- [ ] Coordinator assignment works correctly
- [ ] Only assigned coordinator can verify at Coordinator Scrutiny
- [ ] President can give final approval at President Approval
- [ ] User account created after final approval
- [ ] Family status changes to Approved
- [ ] Remarks are recorded at each stage

---

**All workflows are now correctly implemented! Test with the created family application.**
