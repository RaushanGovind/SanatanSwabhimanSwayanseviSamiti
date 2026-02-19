# WHERE PRESIDENT SEES FAMILY REGISTRATION REQUESTS
# ==================================================

## ANSWER: "Family Directory" Tab

The President will see **new family registration requests** in the **"Family Directory"** tab in the Admin Dashboard.

---

## TAB DETAILS

**Tab Name in Sidebar:** `Family Directory`
**Tab Icon:** 👥 Users icon
**Tab ID:** `family-list`

**Who Can Access:**
- Admin
- Super Admin
- President ✅
- Vice President
- Secretary
- Joint Secretary
- Treasurer
- Executive Member
- Coordinator

---

## WHAT THE PRESIDENT SEES

### Tab Header
- **Title:** "Family Registrations"
- **Counter:** Shows total number of families (e.g., "222 Total")

### Table Columns
1. **Family / Head** - Family head name and member count
2. **Origin** - Shows "Direct" or "Recommendation" (with recommender name if applicable)
3. **Current Stage** - Shows the verification stage:
   - "Recommender Verification"
   - "President Scrutiny" ← **President's pending items**
   - "Secretary Scrutiny"
   - "Coordinator Scrutiny"
   - "President Approval" ← **President's final approval items**
4. **Coordinator** - Assigned coordinator name (or "Not Assigned")
5. **Contact** - Family head's mobile number
6. **Action Center** - Buttons for actions

---

## PRESIDENT'S SPECIFIC VIEWS

### 1. Applications at "President Scrutiny" Stage
**What it means:** New applications that need initial review by President

**Actions Available:**
- 👁️ **View Application** - See full family details
- ✅ **Verify & Forward** - Approve and send to Secretary for coordinator assignment

**Workflow:**
```
President Scrutiny → (President clicks "Verify & Forward") → Secretary Scrutiny
```

---

### 2. Applications at "President Approval" Stage
**What it means:** Applications that have been verified by Coordinator and are ready for final approval

**Actions Available:**
- 👁️ **View Application** - See full family details and verification history
- ✅ **Final Approval** - Give final approval (generates Family ID and Member IDs)

**Workflow:**
```
President Approval → (President clicks "Final Approval") → APPROVED ✅
```

**What happens on Final Approval:**
1. Family Status changes from "Pending" to "Approved"
2. System generates Family ID (e.g., F-0223)
3. System generates Member IDs for all family members (e.g., F-0223-M01, F-0223-M02)
4. User account is created for family head (if not exists)
5. Family can now log in and access Family Dashboard

---

## FILTERING

The "Family Directory" tab shows **ONLY** families with status = "Pending"

**Code Logic:**
```javascript
families.filter(f => f.status === 'Pending')
```

This means:
- ✅ Shows: New applications, applications under verification
- ❌ Hides: Already approved families, rejected applications

---

## VISUAL INDICATORS

### Stage Badge Colors
- **Yellow background** - Pending stages (President Scrutiny, Secretary Scrutiny, etc.)
- **Green background** - Approved status

### Origin Badge Colors
- **Purple background** - Direct applications
- **Teal background** - Recommended applications

---

## PRESIDENT'S WORKFLOW SUMMARY

1. **Log in** with credentials:
   - Phone: 7700000001
   - Password: rajesh123

2. **Click "Family Directory"** tab in sidebar

3. **See pending applications** filtered by stage:
   - Applications at "President Scrutiny" - Need initial review
   - Applications at "President Approval" - Need final approval

4. **For each application:**
   - Click "View Application" to see details
   - Review family information, members, documents
   - Check verification remarks from previous stages
   - Click appropriate action button:
     - "Verify & Forward" (at President Scrutiny stage)
     - "Final Approval" (at President Approval stage)

---

## IMPORTANT NOTES

### Current Data
- Your database has **222 families**
- Most are already approved
- New applications will appear at the top with "President Scrutiny" stage

### Two-Stage President Involvement
The President is involved at **TWO stages**:
1. **Stage 2: President Scrutiny** - Initial review, forward to Secretary
2. **Stage 5: President Approval** - Final approval after coordinator verification

### No Separate "Registrations" Tab
There is **NO separate tab** called "Registrations" or "Family Registrations" in the sidebar. All pending family applications are shown in the **"Family Directory"** tab, filtered to show only those with status = "Pending".

---

## QUICK REFERENCE

| What President Wants to See | Where to Look | What to Click |
|------------------------------|---------------|---------------|
| New applications needing initial review | Family Directory tab | Applications with stage "President Scrutiny" |
| Applications ready for final approval | Family Directory tab | Applications with stage "President Approval" |
| All families (approved + pending) | Family Directory tab | (Shows all pending; approved families are in separate view) |
| Verification history | Family Directory → View Application | See "Remarks" section |

---

## CONCLUSION

✅ **Tab Name:** Family Directory
✅ **What it shows:** All pending family applications
✅ **President's items:** Applications at "President Scrutiny" and "President Approval" stages
✅ **Actions:** Verify & Forward, Final Approval
