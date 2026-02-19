# FAMILY REGISTRATION WORKFLOW - Jagdamba Samiti
# ================================================

## OVERVIEW
The family registration system supports two methods:
1. **Direct Registration** - Family applies directly without recommendation
2. **Recommended Registration** - Family applies with a recommendation token from an existing member

---

## WORKFLOW STAGES

### STAGE 0: INITIAL REGISTRATION
**Entry Points:**
- **Option A: Direct Signup** (`/api/auth/signup`)
  - Family head creates account with phone + password
  - System creates:
    - User account (role: family_head, status: Profile Incomplete)
    - Preliminary family record (status: Profile Incomplete, stage: Not Submitted)
  - Next: Family head logs in and completes profile

- **Option B: Direct Registration** (`/api/families/register`)
  - Family submits complete application without account
  - System creates family record (status: Pending, stage: President Scrutiny)
  - Next: Goes directly to President Scrutiny

- **Option C: Recommended Registration**
  1. Existing member generates recommendation token (`/api/families/recommend`)
  2. New family uses token during registration
  3. System creates family record (status: Pending, stage: Recommender Verification)
  4. Next: Goes to Recommender Verification

---

## VERIFICATION STAGES (for Pending Applications)

### STAGE 1: RECOMMENDER VERIFICATION (Recommended applications only)
**Who can verify:** The member who issued the recommendation token
**Actions:**
- Review application details
- Verify family information
- Click "Verify & Forward"

**On Approval:**
- Status: Pending → Pending
- Stage: Recommender Verification → **President Scrutiny**
- Logged: Recommender name, date, remarks

---

### STAGE 2: PRESIDENT SCRUTINY (All applications)
**Who can verify:** President or Vice President
**Actions:**
- Initial review of application
- Check eligibility criteria
- Click "Verify & Forward to Secretary"

**On Approval:**
- Status: Pending → Pending
- Stage: President Scrutiny → **Secretary Scrutiny**
- Logged: President name, date, remarks

---

### STAGE 3: SECRETARY SCRUTINY
**Who can verify:** Secretary or Joint Secretary
**Actions:**
- Assign a Coordinator to the family
- Select coordinator from dropdown
- Click "Assign & Verify"

**On Assignment:**
- Coordinator assigned to family record
- Status: Pending → Pending
- Stage: Secretary Scrutiny → **Coordinator Scrutiny**
- Logged: Secretary name, coordinator assigned, date, remarks

---

### STAGE 4: COORDINATOR SCRUTINY
**Who can verify:** Assigned Coordinator only (or Super Admin)
**Actions:**
- Field verification of family details
- Visit family if needed
- Verify documents
- Click "Verify & Forward to President"

**On Approval:**
- Status: Pending → Pending
- Stage: Coordinator Scrutiny → **President Approval**
- Logged: Coordinator name, date, remarks

---

### STAGE 5: PRESIDENT APPROVAL (Final Stage)
**Who can approve:** President or Vice President
**Actions:**
- Final review of all verification stages
- Review remarks from all verifiers
- Click "✓ Final Approve"

**On Final Approval:**
- **Status: Pending → APPROVED**
- **Stage: President Approval → Approved**
- System automatically:
  1. Generates Family ID (Format: F-0001, F-0002, etc.)
  2. Generates Member IDs for all family members (Format: F-0001-M01, F-0001-M02, etc.)
  3. Creates user account for family head (if not exists)
     - Phone: from application
     - Password: auto-generated (sent via SMS/email)
     - Role: family_head
     - Linked to family record
  4. Updates family status to "Approved"
  5. Logs approval action

**Family is now active and can:**
- Log in to Family Dashboard
- View family details
- Request profile updates
- Apply for assistance
- View notices and rules

---

## WORKFLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────────┐
│                    ENTRY POINTS                                  │
└─────────────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
   [Direct Signup]   [Direct Register]  [Recommended Register]
        │                  │                  │
        ▼                  │                  ▼
 Complete Profile          │          Recommender Verification
        │                  │                  │
        └──────────────────┴──────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  STAGE 2: PRESIDENT SCRUTINY                                     │
│  ✓ President/VP reviews application                             │
│  → Forwards to Secretary                                         │
└─────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  STAGE 3: SECRETARY SCRUTINY                                     │
│  ✓ Secretary assigns Coordinator                                │
│  → Forwards to Coordinator                                       │
└─────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  STAGE 4: COORDINATOR SCRUTINY                                   │
│  ✓ Coordinator verifies family (field visit)                    │
│  → Forwards back to President                                    │
└─────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  STAGE 5: PRESIDENT APPROVAL (FINAL)                             │
│  ✓ President gives final approval                               │
│  → System generates IDs & creates account                        │
└─────────────────────────────────────────────────────────────────┘
                           │
                           ▼
                    ✅ APPROVED
                  (Family is Active)
```

---

## KEY FEATURES

### 1. **Audit Trail**
Every stage transition is logged with:
- Verifier name and role
- Date and time
- Remarks/comments
- Previous and new stage

### 2. **Role-Based Access**
- **President/VP:** Can verify President Scrutiny and give Final Approval
- **Secretary/Joint Secretary:** Can assign coordinators at Secretary Scrutiny
- **Coordinator:** Can verify only families assigned to them
- **Recommender:** Can verify only families they recommended
- **Super Admin:** Can verify at any stage

### 3. **Data Validation**
- Phone number uniqueness
- Required fields validation
- Recommendation token verification
- Coordinator assignment before forwarding

### 4. **Automatic ID Generation**
- Family ID: Sequential (F-0001, F-0002, ...)
- Member ID: Family-based (F-0001-M01, F-0001-M02, ...)
- User account creation with secure password

---

## REJECTION FLOW

At any stage, authorized users can **reject** an application:
- Application status changes to "Rejected"
- Rejection reason is logged
- Family head is notified
- Application can be resubmitted after corrections

---

## PROFILE UPDATES (Post-Approval)

Once approved, families can request profile updates:
1. Family head submits update request
2. Request goes through verification stages based on update type
3. Committee approves/rejects changes
4. Approved changes are applied to family record

---

## TECHNICAL ENDPOINTS

### Registration
- `POST /api/auth/signup` - Create account + preliminary record
- `POST /api/families/register` - Direct registration
- `POST /api/families/complete-profile` - Complete profile after signup

### Verification
- `POST /api/families/{id}/verify-stage` - Move to next stage
- `POST /api/families/{id}/approve` - Final approval (President only)
- `POST /api/families/{id}/reject` - Reject application

### Recommendation
- `POST /api/families/recommend` - Generate recommendation token
- `POST /api/families/verify-token/{token}` - Verify token validity

### Coordinator Assignment
- `POST /api/families/{id}/assign-coordinator` - Assign coordinator (Secretary)

---

## CURRENT STATUS TRACKING

Families can be in one of these states:

**Status:**
- `Profile Incomplete` - Account created, profile not submitted
- `Pending` - Under verification
- `Approved` - Active member
- `Rejected` - Application rejected

**Verification Stage (for Pending):**
- `Not Submitted` - Profile incomplete
- `Recommender Verification` - Awaiting recommender
- `President Scrutiny` - Awaiting president initial review
- `Secretary Scrutiny` - Awaiting coordinator assignment
- `Coordinator Scrutiny` - Awaiting coordinator verification
- `President Approval` - Awaiting final approval
- `Approved` - Completed

---

## SUMMARY

The workflow ensures:
✅ Multi-level verification for quality control
✅ Clear responsibility at each stage
✅ Complete audit trail
✅ Flexibility for direct or recommended registration
✅ Automatic ID generation and account creation
✅ Role-based access control
