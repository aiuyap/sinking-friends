**Warning Toasts:**
1. Navigate to group settings as admin
2. Scroll to "Danger Zone" section
3. Click "Delete Group" button
4. Type an incorrect group name in the confirmation field
5. Click "Delete"
6. **Expected:** Yellow/orange warning toast appears about name mismatch
7. **Verify:** Shows warning icon, proper warning colors

**General Verification:**
1. **Position:** Verify all toasts appear in the bottom right corner
2. **Auto-dismiss:** Wait 5 seconds, verify they automatically disappear
3. **Icons:** Verify each toast type has appropriate icons:
   - Success: Checkmark icon
   - Error: X icon
   - Warning: Warning/alert icon
4. **Colors:** Verify proper color coding:
   - Success: Green background
   - Error: Red background
   - Warning: Yellow/orange background
5. **Stacking:** Trigger multiple toasts quickly, verify they stack properly

---

### Test 5: Enhanced Group Creation Form

**Test All Configuration Fields:**
1. Navigate to `/groups/new` or click "Create New Group"
2. **Expected:** Form loads with multiple sections:
   - General Information (Name*, Description)
   - Loan Settings (Interest rates, Term, Grace period)
   - Year-End Distribution (Date picker)

**Test Default Values:**
1. Verify defaults are set correctly:
   - Member Interest Rate: 5%
   - Non-Member Interest Rate: 10%
   - Loan Term: 2 months
   - Grace Period: 7 days

**Test Validation:**
1. Try to submit without filling Group Name
2. **Expected:** Error message "Group name is required"
3. Try to submit without Year-End Date
4. **Expected:** Error message "Year-end distribution date is required"

**Test Successful Creation:**
1. Fill all required fields:
   - Name: "Test Group"
   - Member Interest: 6%
   - Non-Member Interest: 12%
   - Term: 3 months
   - Grace Period: 5 days
   - Year-End Date: Future date
2. Click "Create Group"
3. **Expected:** Green success toast appears
4. **Expected:** Redirected to new group's detail page
5. **Verify:** All settings were saved correctly

**Test Settings Consistency:**
1. Create a group with custom values
2. Navigate to the group's Settings page
3. **Expected:** All values match what was entered during creation
4. **Verify:** Interest rates, term, grace period, and year-end date are correct

---

## What's Working Now - COMPLETE! ✅

### Pages

- `/groups/new` ⭐ **NEWLY ENHANCED** - Now includes all configuration fields during creation

### Features

- ✅ **Group Creation** - Full configuration during setup (interest rates, term, grace period, year-end)
