# MIMI Planning - How Doctor Scheduling Works
## A Simple Guide for Non-Technical Colleagues

---

## 🎯 What This Document Explains

This document explains **exactly how the MIMI Planning app creates doctor schedules**, from the very first step to the final calendar. By the end, you'll understand:
- What information the system starts with
- How it decides which doctor does what activity
- Why certain doctors get assigned certain tasks
- How the system makes sure everything is covered

---

## 📋 Table of Contents

1. [The Big Picture](#the-big-picture)
2. [Starting Point: What We Know About Each Doctor](#starting-point-what-we-know-about-each-doctor)
3. [Step-by-Step: How Schedules Are Built](#step-by-step-how-schedules-are-built)
4. [Phase 1: Setting Up Fixed Activities (Backbones)](#phase-1-setting-up-fixed-activities-backbones)
5. [Phase 2: Assigning Rotating Activities](#phase-2-assigning-rotating-activities)
6. [Phase 3: Resolving Conflicts and Filling Gaps](#phase-3-resolving-conflicts-and-filling-gaps)
7. [Final Result: The Complete Schedule](#final-result-the-complete-schedule)
8. [Understanding Rotation Cycles](#understanding-rotation-cycles)
9. [Key Concepts Summary](#key-concepts-summary)

---

## 🌟 The Big Picture

Think of scheduling like building with LEGO blocks:

1. **Step 1**: Each doctor has some pieces already glued in place (their **backbone** - fixed activities)
2. **Step 2**: We add rotating pieces that doctors take turns doing (like **HTC1**, **HDJ**, **EMIT**)
3. **Step 3**: We check if everything fits together and fix any problems

```
Week View Example:
┌─────────┬─────────┬─────────┬─────────┬─────────┐
│ Monday  │ Tuesday │Wednesday│Thursday │ Friday  │
├─────────┼─────────┼─────────┼─────────┼─────────┤
│   AM    │   AM    │   AM    │   AM    │   AM    │
│  [TP]   │ [TeleCs]│  [TP]   │ [TeleCs]│[Cheffer]│
├─────────┼─────────┼─────────┼─────────┼─────────┤
│   PM    │   PM    │   PM    │   PM    │   PM    │
│  [TP]   │  [Cs]   │  [TP]   │  [Cs]   │ [Staff] │
└─────────┴─────────┴─────────┴─────────┴─────────┘
        YC's Fixed Schedule (Backbone)
```

---

## 📊 Starting Point: What We Know About Each Doctor

### Information We Have for Each Doctor

For each doctor in our system (YC, FL, NS, GC, CL, DL, MG, RNV, MDLC, BM), we know:

#### 1. **Backbone** (Fixed Weekly Schedule)
   - Activities the doctor **always** does, no matter what
   - These never change and are "glued" into their schedule

   **Example - Doctor YC:**
   - Monday AM/PM: TP (Part-time private practice)
   - Tuesday AM: TeleCs (Telemedicine consultations)
   - Tuesday PM: Cs (Regular consultations)
   - Wednesday AM/PM: TP
   - Thursday AM: TeleCs
   - Thursday PM: Cs
   - Friday AM/PM: Chefferie + Staff

#### 2. **Skills** (What They Can Do)
   - List of medical activities this doctor is trained/qualified to perform

   **Example - Doctor FL:**
   - HTC1 (HIV Treatment Center 1)
   - HTC1_visite (Home visits for HTC1)
   - HDJ (Day Hospital)
   - AMI (Infectious Disease Outreach)
   - EMIT (Infectious Disease Evaluation Team)
   - EMATIT (Antibiotic Treatment Team)

#### 3. **Rotation Setting** (What They Take Turns Doing)
   - The main activities they rotate through over time

   **Example - Doctor FL:**
   - Rotates through: HTC1 → HDJ → AMI
   - This means:
     - Period 1: FL does HTC1
     - Period 2: FL does HDJ
     - Period 3: FL does AMI
     - Period 4: Back to HTC1... (repeats)

#### 4. **Weekly Needs** (Special Requirements)
   - Some doctors need specific activities in their week

   **Example - Doctor FL:**
   - Needs 2 TeleCs sessions per week
   - Can be AM or PM
   - But NOT on Wednesday (TP day)

### Medical Activities and Their Time Requirements

Each activity takes a certain amount of time (measured in hours per 4-hour slot):

| Activity | Duration | Meaning |
|----------|----------|---------|
| **HTC1** | 1 hour | Quick HIV consultations |
| **HTC1_visite** | 4 hours | Full slot for home visits |
| **HDJ** | 4 hours | Day hospital - full slot |
| **EMIT** | 3 hours | Infectious disease evaluations |
| **AMI** | 1 hour | Outreach consultations |
| **Cs** | 3 hours | Standard consultations |
| **TeleCs** | 3 hours | Telemedicine |
| **TP** | 4 hours | Part-time (doctor unavailable) |
| **Chefferie** | 4 hours | Administrative leadership |
| **Staff** | 0 hours | Staff meetings (doesn't block time) |

**Why This Matters:**
- A 4-hour morning slot can fit: `HTC1 (1h) + Cs (3h) = 4h` ✅
- But NOT: `HDJ (4h) + anything else` ❌
- Staff (0h) can happen alongside other activities ✅

---

## 🔧 Step-by-Step: How Schedules Are Built

### The Three-Phase Algorithm

The app builds schedules in **3 phases**, like assembling a puzzle:

```
INPUT                    PHASE 1                 PHASE 2                 PHASE 3                OUTPUT

Doctor Profiles    →    Add Backbones    →    Assign Rotations   →   Resolve Conflicts   →   Final Schedule
(skills, backbones)     (fixed activities)     (HTC/HDJ/EMIT)         (fix overlaps)          (complete calendar)
                                                                      (fill gaps)
```

---

## 🧱 Phase 1: Setting Up Fixed Activities (Backbones)

### What Happens
The system starts by placing each doctor's **backbone** activities into their weekly schedule. These are activities that **never change**.

### Example: Doctor YC

**Input (YC's Backbone):**
```javascript
{
  Monday:    { "9am-1pm": ["TP"],     "2pm-6pm": ["TP"] },
  Tuesday:   { "9am-1pm": ["TeleCs"], "2pm-6pm": ["Cs"] },
  Wednesday: { "9am-1pm": ["TP"],     "2pm-6pm": ["TP"] },
  Thursday:  { "9am-1pm": ["TeleCs"], "2pm-6pm": ["Cs"] },
  Friday:    { "9am-1pm": ["Chefferie"], "2pm-6pm": ["Staff", "Chefferie"] }
}
```

**Visual Result:**
```
YC's Week After Phase 1 (Backbone Only):
┌─────────┬─────────┬─────────┬─────────┬─────────┐
│ MON     │ TUE     │ WED     │ THU     │ FRI     │
├─────────┼─────────┼─────────┼─────────┼─────────┤
│ AM      │ AM      │ AM      │ AM      │ AM      │
│ TP      │ TeleCs  │ TP      │ TeleCs  │Chefferie│
│         │         │         │         │         │
├─────────┼─────────┼─────────┼─────────┼─────────┤
│ PM      │ PM      │ PM      │ PM      │ PM      │
│ TP      │ Cs      │ TP      │ Cs      │ Staff + │
│         │         │         │         │Chefferie│
└─────────┴─────────┴─────────┴─────────┴─────────┘
```

**Key Point:**
- TP slots mean the doctor is **not available** for other activities
- TeleCs/Cs slots are **partially filled** (only 3 hours used out of 4)
- Friday PM has **Staff (0h)** + **Chefferie (4h)** - this is allowed!

---

## 🔄 Phase 2: Assigning Rotating Activities

### What Happens
The system looks at which doctors should do **rotating activities** this period, then adds those activities to their schedules.

### Understanding Rotation Cycles

The system uses **rotation cycles** - predefined patterns that say which doctor does which activity in each period.

**Example Rotation Cycle: "honeymoon_NS_noHDJ"**

This cycle has 6 periods and specifies assignments for each:

```
Period 1:
  HTC1  → FL
  HDJ   → CL
  AMI   → NS
  HTC2  → MG
  EMIT  → MDLC
  EMATIT→ RNV

Period 2:
  HTC1  → CL
  HDJ   → FL
  AMI   → NS
  HTC2  → MDLC
  EMIT  → RNV
  EMATIT→ MG

... (continues for 6 periods)
```

### How Activities Get Added

For each assigned activity, the system:

1. **Gets the activity template** - the ideal weekly pattern for this activity
2. **Checks what's already assigned** - looks at all doctor backbones
3. **Calculates remaining tasks** - what still needs to be covered
4. **Merges with doctor's backbone** - adds activities that fit

#### Example: Adding HTC1 to Doctor FL (Period 1)

**Step 1: HTC1 Template (What HTC1 Needs Each Week)**
```
{
  Monday:    { "9am-1pm": ["HTC1"], "2pm-6pm": ["HTC1"] },
  Tuesday:   { "9am-1pm": ["HTC1_visite"], "2pm-6pm": ["HTC1"] },
  Wednesday: { "9am-1pm": ["HTC1"], "2pm-6pm": ["HTC1"] },
  Thursday:  { "9am-1pm": ["HTC1"], "2pm-6pm": ["HTC1"] },
  Friday:    { "9am-1pm": ["HTC1_visite"], "2pm-6pm": ["HTC1"] }
}
```

**Step 2: FL's Backbone (Before HTC1)**
```
{
  Monday:    { "9am-1pm": ["Cs"],    "2pm-6pm": [] },
  Tuesday:   { "9am-1pm": [],        "2pm-6pm": ["Cs"] },
  Wednesday: { "9am-1pm": ["TP"],    "2pm-6pm": ["TP"] },
  Thursday:  { "9am-1pm": [],        "2pm-6pm": [] },
  Friday:    { "9am-1pm": [],        "2pm-6pm": ["Staff"] }
}
```

**Step 3: Check Capacity and Merge**
- Monday AM: Cs (3h) + can we add HTC1 (1h)? → 3+1=4h ✅
- Monday PM: Empty (0h) + HTC1 (1h)? → 1h ✅
- Tuesday AM: Empty (0h) + HTC1_visite (4h)? → 4h ✅
- Tuesday PM: Cs (3h) + HTC1 (1h)? → 4h ✅
- Wednesday: TP (4h) → NO ROOM ❌ Skip!
- Thursday AM: Empty + HTC1 (1h)? → 1h ✅
- Thursday PM: Empty + HTC1 (1h)? → 1h ✅
- Friday AM: Empty + HTC1_visite (4h)? → 4h ✅
- Friday PM: Staff (0h) + HTC1 (1h)? → 1h ✅

**Step 4: FL's Schedule After Adding HTC1**
```
{
  Monday:    { "9am-1pm": ["Cs", "HTC1"],           "2pm-6pm": ["HTC1"] },
  Tuesday:   { "9am-1pm": ["HTC1_visite"],          "2pm-6pm": ["Cs", "HTC1"] },
  Wednesday: { "9am-1pm": ["TP"],                   "2pm-6pm": ["TP"] },
  Thursday:  { "9am-1pm": ["HTC1"],                 "2pm-6pm": ["HTC1"] },
  Friday:    { "9am-1pm": ["HTC1_visite"],          "2pm-6pm": ["Staff", "HTC1"] }
}
```

**Visual Result:**
```
FL's Week After Adding HTC1 (Period 1):
┌─────────┬─────────┬─────────┬─────────┬─────────┐
│ MON     │ TUE     │ WED     │ THU     │ FRI     │
├─────────┼─────────┼─────────┼─────────┼─────────┤
│ AM      │ AM      │ AM      │ AM      │ AM      │
│ Cs (3h) │HTC1_vis │ TP      │ HTC1    │HTC1_vis │
│+HTC1(1h)│  (4h)   │         │  (1h)   │  (4h)   │
├─────────┼─────────┼─────────┼─────────┼─────────┤
│ PM      │ PM      │ PM      │ PM      │ PM      │
│ HTC1    │ Cs (3h) │ TP      │ HTC1    │ Staff   │
│  (1h)   │+HTC1(1h)│         │  (1h)   │+HTC1(1h)│
└─────────┴─────────┴─────────┴─────────┴─────────┘
```

### This Happens for All Rotating Activities

The same process repeats for:
- **HTC1** assignment
- **HTC2** assignment
- **HDJ** assignment
- **AMI** assignment
- **EMIT** assignment
- **EMATIT** assignment

After Phase 2, every doctor has their backbone **plus** their assigned rotating activities.

---

## ⚖️ Phase 3: Resolving Conflicts and Filling Gaps

After Phase 2, we might have problems:
- **Missing activities** - Some required activities aren't covered
- **Duplicate activities** - Two doctors assigned the same activity at the same time
- **Unfair workload** - One doctor has way more work than others

Phase 3 fixes these issues using **conflict resolvers**.

### Problem 1: Duplicate HTC Activities

**Scenario:** Both FL and CL are assigned HTC1 on Thursday AM

**What the Conflict Resolver Does:**
1. **Counts current assignments:**
   - FL has HTC1: 8 slots
   - CL has HTC1: 4 slots

2. **Compares workload:**
   - FL: 32 hours total this week
   - CL: 28 hours total this week

3. **Removes from busier doctor:** FL is busier, so remove HTC1 from FL's Thursday AM

4. **Result:** Only CL keeps Thursday AM HTC1 ✅

### Problem 2: Missing TeleCs Coverage

**Scenario:** Not enough TeleCs slots are covered

**What the Conflict Resolver Does:**
1. **Finds doctors who need TeleCs:**
   - FL needs 2 TeleCs per week
   - NS needs 2 TeleCs per week
   - MG needs 2 TeleCs per week

2. **Finds available slots:**
   - FL: Tuesday PM has Cs (3h), can add TeleCs instead? Check constraints...
   - FL constraint: "Can be AM or PM, but NOT Wednesday"
   - Tuesday PM is OK ✅

3. **Replaces activity:** Change Tuesday PM from [Cs] to [TeleCs]

4. **Updates workload tracker:** Add TeleCs duration to FL's workload

5. **Result:** TeleCs is now covered ✅

### Problem 3: Unfair Workload Distribution

**Scenario:** After assignments, NS has 40 hours while CL has 25 hours

**What the System Does:**
1. **Calculates equity score:**
   - Average workload: 32 hours
   - NS deviation: +8 hours
   - CL deviation: -7 hours
   - Equity score: 73% (not ideal)

2. **Identifies moveable activities:**
   - Can we move some AMI from NS to CL?
   - Check: Does CL have the AMI skill? Yes ✅
   - Check: Does CL have capacity? Yes ✅

3. **Transfers activity:**
   - Remove AMI from NS's Tuesday PM
   - Add AMI to CL's Tuesday PM

4. **Recalculates equity:**
   - New NS workload: 39 hours
   - New CL workload: 26 hours
   - New equity score: 78% (better!)

---

## 📅 Final Result: The Complete Schedule

After all three phases, we have a **complete, valid schedule** where:

✅ Every required medical activity is covered
✅ No activity is assigned to two doctors at once
✅ All doctors respect their backbone constraints
✅ Workload is distributed fairly
✅ Special requirements (like TeleCs needs) are met

### Example Final Schedule - Week 44 (Period 1)

```
Complete Medical Team Schedule:

Doctor YC:
┌─────────┬─────────┬─────────┬─────────┬─────────┐
│ MON     │ TUE     │ WED     │ THU     │ FRI     │
├─────────┼─────────┼─────────┼─────────┼─────────┤
│ AM: TP  │TeleCs   │ AM: TP  │TeleCs   │Chefferie│
│ PM: TP  │Cs       │ PM: TP  │Cs       │Staff+   │
│         │         │         │         │Chefferie│
└─────────┴─────────┴─────────┴─────────┴─────────┘

Doctor FL:
┌─────────┬─────────┬─────────┬─────────┬─────────┐
│ MON     │ TUE     │ WED     │ THU     │ FRI     │
├─────────┼─────────┼─────────┼─────────┼─────────┤
│Cs+HTC1  │HTC1_vis │ AM: TP  │HTC1     │HTC1_vis │
│HTC1     │TeleCs+  │ PM: TP  │HTC1     │Staff+   │
│         │HTC1     │         │         │HTC1     │
└─────────┴─────────┴─────────┴─────────┴─────────┘

Doctor CL:
┌─────────┬─────────┬─────────┬─────────┬─────────┐
│ MON     │ TUE     │ WED     │ THU     │ FRI     │
├─────────┼─────────┼─────────┼─────────┼─────────┤
│ AM: TP  │TeleCs   │ AM: TP  │TeleCs+  │HDJ      │
│ PM: TP  │HDJ      │Cs       │HDJ      │Staff+   │
│         │         │         │         │Cs       │
└─────────┴─────────┴─────────┴─────────┴─────────┘

... (and so on for all doctors)
```

---

## 🔄 Understanding Rotation Cycles

### What Is a Rotation Cycle?

A **rotation cycle** is a predefined pattern that determines which doctor handles which rotating activity in each period.

Think of it like a sports team roster rotation - different players take different positions each game.

### Example: The "honeymoon_NS_noHDJ" Cycle

This cycle is designed for a scenario where:
- Doctor NS is at full capacity (100%)
- NS does **not** do HDJ (Day Hospital)
- NS focuses on AMI (Infectious Disease Outreach)

**The 6-Period Pattern:**

```
Period 1 → Period 2 → Period 3 → Period 4 → Period 5 → Period 6 → (repeats)

HTC1:
  FL    →    CL    →    NS    →    FL    →    CL    →    NS

HDJ:
  CL    →    FL    →    FL    →    CL    →    FL    →    CL

AMI:
  NS    →    NS    →    CL    →    NS    →    NS    →    FL

HTC2:
  MG    →   MDLC   →   RNV    →    MG    →   MDLC   →   RNV

EMIT:
 MDLC   →   RNV    →    MG    →   MDLC   →   RNV    →    MG

EMATIT:
 RNV    →    MG    →   MDLC   →   RNV    →    MG    →   MDLC
```

### Why Use Rotation Cycles?

1. **Fair Distribution** - Everyone gets a turn at different activities
2. **Predictability** - Doctors know what's coming next
3. **Flexibility** - Can switch cycles based on team availability
4. **Balance** - Ensures no one gets overloaded with hard tasks

### Available Cycles in MIMI Planning

1. **honeymoon_NS_noHDJ** - "NS at 100% without HDJ"
2. **honeymoon_NS_HDJ** - "NS at 100% with HDJ"
3. **NoMG** - "MG unavailable"
4. **emergency** - "Minimal rotations for crisis situations"

---

## 📖 Key Concepts Summary

### 1. Doctor Profile
**What it is:** All the information about a doctor
**Contains:**
- Backbone (fixed activities)
- Skills (what they can do)
- Rotation setting (what they rotate through)
- Weekly needs (special requirements)

### 2. Backbone
**What it is:** Activities a doctor **always** does
**Example:** YC always does TP on Monday/Wednesday, TeleCs on Tuesday/Thursday AM
**Why it matters:** These can never be changed or removed

### 3. Rotation
**What it is:** Activities doctors **take turns** doing
**Example:** HTC1 → Period 1: FL, Period 2: CL, Period 3: NS
**Why it matters:** Ensures fair distribution of specialized work

### 4. Activity Template
**What it is:** The ideal weekly pattern for an activity
**Example:** HTC1 needs coverage Monday-Friday, AM and PM, with visits on Tuesday/Friday
**Why it matters:** The system tries to match this template

### 5. Remaining Tasks
**What it is:** Activities not yet covered by any doctor's backbone
**How it's calculated:** Template - Sum of all backbones
**Why it matters:** These are what get assigned in rotations

### 6. Capacity
**What it is:** Available time in a time slot (max 4 hours)
**Example:** If Cs (3h) is already scheduled, only 1 hour remains
**Why it matters:** Can't overfill a time slot

### 7. Conflict Resolution
**What it is:** Fixing problems after initial assignments
**Types of problems:**
- Missing coverage (no one assigned)
- Duplicate coverage (two doctors assigned)
- Unfair workload (one doctor has too much)

### 8. Rotation Cycle
**What it is:** A predefined pattern for 6 periods
**Contains:** Which doctor does which activity in each period
**Why it matters:** Provides consistency and predictability

---

## 🎓 Understanding Through Examples

### Complete Example: How Wednesday Gets Built

Let's follow **Wednesday, Period 1** through all phases:

**Phase 1: Backbones Only**
```
Wednesday Morning (9am-1pm):
- YC: TP (4h) - Unavailable
- FL: TP (4h) - Unavailable
- CL: Empty - Available
- NS: Empty - Available
- GC: Cs (3h) - 1h remaining
- MG: TP (4h) - Unavailable
- RNV: Empty - Available
- MDLC: TP (4h) - Unavailable
- BM: TP (4h) - Unavailable
- DL: TP (4h) - Unavailable

Wednesday Afternoon (2pm-6pm):
- YC: TP (4h) - Unavailable
- FL: TP (4h) - Unavailable
- CL: Cs (3h) - 1h remaining
- NS: Cs (3h) - 1h remaining
- GC: Empty - Available
- MG: TP (4h) - Unavailable
- RNV: Cs (3h) - 1h remaining
- MDLC: Cs (3h) - 1h remaining
- BM: TP (4h) - Unavailable
- DL: TP (4h) - Unavailable
```

**Phase 2: Add Rotations (Period 1)**
```
Rotation Assignments for Period 1:
- HTC1 → FL (but Wednesday = TP, skip)
- HDJ → CL (add to Wednesday if space)
- AMI → NS (add to Wednesday PM: Cs+AMI)
- HTC2 → MG (but Wednesday = TP, skip)
- EMIT → MDLC (but Wednesday = TP, skip)
- EMATIT → RNV (add to Wednesday PM: Cs+EMATIT)

After Phase 2:
Wednesday Afternoon (2pm-6pm):
- CL: Cs + HDJ (3h + 4h = 7h) ⚠️ OVERFLOW!
- NS: Cs + AMI (3h + 1h = 4h) ✅
- RNV: Cs + EMATIT (3h + 3h = 6h) ⚠️ OVERFLOW!
```

**Phase 3: Resolve Conflicts**
```
Problem 1: CL Wednesday PM overflow (7h in 4h slot)
Solution: Remove Cs, keep HDJ → CL: [HDJ] (4h) ✅

Problem 2: RNV Wednesday PM overflow (6h in 4h slot)
Solution: Keep what fits best:
  - Option A: Keep Cs (3h) ← backbone priority
  - Option B: Keep EMATIT (3h) ← rotation priority
Decision: Keep both if possible, or prioritize Cs
Final: RNV: [Cs, EMATIT...partial] → Check other days

Final Wednesday Schedule:
Morning (9am-1pm):
- Available doctors: CL, NS, GC (1h), RNV
- After all assignments: [Activities distributed]

Afternoon (2pm-6pm):
- CL: HDJ (4h) ✅
- NS: Cs + AMI (4h) ✅
- GC: [Activity] ✅
- RNV: Cs (3h) ✅
- MDLC: Cs + [Activity] ✅
```

---

## ✅ Validation and Quality Checks

After building the schedule, the system validates:

### 1. Coverage Check
**Question:** Are all required activities assigned?

**Required Activities by Day:**
- Monday AM: HTC1, HTC2, EMIT, EMATIT
- Tuesday AM: HTC1_visite, HTC2_visite, EMIT, HDJ, EMATIT
- Wednesday AM: HTC1, HTC2, EMIT, EMATIT
- Thursday AM: HTC1, HTC2, EMIT, HDJ, EMATIT
- Friday AM: HTC1_visite, HTC2_visite, EMIT, HDJ, EMATIT

**Check Process:**
```
For each day:
  For each time slot:
    For each required activity:
      Count how many doctors are assigned
      If count = 0 → ❌ MISSING
      If count = 1 → ✅ PERFECT
      If count > 1 → ⚠️ DUPLICATE
```

### 2. Workload Equity Check
**Question:** Is work distributed fairly?

**Calculation:**
```
For each doctor:
  Total hours = Sum of all activity durations this week

Average hours = (Sum of all doctor hours) / (Number of doctors)

For each doctor:
  Deviation = |Doctor hours - Average hours|
  Deviation % = Deviation / Average hours

Equity Score = 100% - (Average deviation %)
```

**Targets:**
- Equity Score > 90% → ✅ Excellent
- Equity Score 80-90% → ⚠️ Good
- Equity Score < 80% → ❌ Needs improvement

### 3. Skill Compliance Check
**Question:** Is each doctor only assigned activities they can do?

**Check Process:**
```
For each doctor:
  For each assigned activity:
    If activity is in doctor's skills → ✅ OK
    If activity is not in skills → ❌ ERROR
```

### 4. Constraint Validation
**Question:** Are all special requirements met?

**Examples:**
- FL needs 2 TeleCs per week, not on Wednesday
- YC needs TeleCs on Tuesday and Thursday AM
- All doctors need exactly 1 Staff meeting on Friday PM

---

## 🚀 From Start to Finish: The Complete Journey

**Starting Point:**
```
Input:
- 10 doctors with profiles
- Selected rotation cycle (e.g., "honeymoon_NS_noHDJ")
- Selected period (e.g., Period 1)
```

**Step 1: Initialize (Phase 1)**
```
For each doctor:
  Create weekly schedule
  Add backbone activities

Result: 10 schedules with fixed activities only
```

**Step 2: Assign Rotations (Phase 2)**
```
For each rotating activity (HTC1, HDJ, AMI, HTC2, EMIT, EMATIT):
  1. Look up who's assigned in rotation cycle
  2. Get activity template
  3. Calculate remaining tasks
  4. Merge with assigned doctor's schedule

Result: 10 schedules with backbones + assigned rotations
```

**Step 3: Fix Problems (Phase 3)**
```
Run conflict resolvers in sequence:
  1. resolveHTCConflicts() → Fix HTC1/HTC2 overlaps
  2. resolveEMITConflicts() → Fix EMIT overlaps
  3. resolveEMATITConflicts() → Fix EMATIT overlaps
  4. resolveTeleCsConflicts() → Ensure TeleCs coverage

Result: 10 schedules with all conflicts resolved
```

**Step 4: Validate**
```
Run validation checks:
  1. Coverage check → All activities assigned?
  2. Duplicate check → No double-assignments?
  3. Workload check → Fair distribution?
  4. Constraint check → All requirements met?

Result: Quality metrics and validation report
```

**Final Output:**
```
✅ Complete schedule for Period 1
✅ All doctors have valid schedules
✅ All activities are covered
✅ Workload is fair
✅ Ready to display in calendar
```

---

## 💡 Why This System Works

### 1. **Hierarchical Structure**
- Fixed activities (backbones) are set first and never change
- Rotating activities are added second and can be adjusted
- This prevents breaking doctors' essential commitments

### 2. **Capacity-Aware**
- System knows each time slot is 4 hours
- System knows each activity's duration
- Won't overfill slots (respects math: 3h + 2h = 5h > 4h ❌)

### 3. **Fair Distribution**
- Tracks cumulative workload across all assignments
- Actively balances work during conflict resolution
- Uses rotation cycles to ensure everyone gets variety

### 4. **Flexible**
- Multiple rotation cycles for different scenarios
- Easy to switch cycles based on team availability
- Conflict resolvers can adapt to problems

### 5. **Validated**
- Every schedule is checked for errors
- Clear metrics show quality (equity score, coverage %)
- Problems are clearly identified and can be fixed

---

## 📞 Questions Your Colleagues Might Ask

### Q: "How do I know if the schedule is good?"

**A:** Look at these metrics in the app:
- **Coverage:** Should be 100% (all activities assigned)
- **Duplicates:** Should be 0 (no double-assignments)
- **Equity Score:** Should be > 85% (fair workload)
- **Green checkmarks (✅):** Each day/slot should have one

---

### Q: "Can I change a doctor's backbone?"

**A:** Yes, but carefully! Backbones are in `doctorSchedules.js`. Changing them affects **all** periods. Make sure:
- Total hours ≤ 40 per week
- No conflicting time slots (e.g., two activities at same time)
- Essential activities (like Staff meetings) are kept

---

### Q: "What if a doctor is on vacation?"

**A:** Two options:
1. **Temporary:** Use the activity editor in the UI to change specific weeks
2. **Extended:** Create a new rotation cycle where that doctor isn't assigned rotating activities

---

### Q: "Why did the system assign doctor X to activity Y?"

**A:** Check the rotation cycle! In `customPlanningLogic.js`, look at the current cycle's period assignments. For example:
```javascript
period: 1,
HTC1: "FL",  ← This is why FL got HTC1 in Period 1
```

---

### Q: "How do I make the workload more fair?"

**A:** The system automatically tries to balance workload. If it's still unfair:
1. Check if rotation cycles are balanced (each doctor gets similar activities)
2. Look at backbones - some doctors might have very full or very empty backbones
3. Adjust activity durations in `docActivities` if they're wrong

---

### Q: "What's the difference between a period and a week?"

**A:**
- **Period** = A scheduling phase (1-6), determines rotation assignments
- **Week** = A calendar week (Week 44, Week 45, etc.), displays on calendar

The system maps periods to weeks. For example:
- Period 1 might display in Week 44
- Period 2 might display in Week 45
- And so on...

---

## 📚 Glossary of Terms

| Term | Simple Definition | Example |
|------|------------------|---------|
| **Backbone** | Fixed activities a doctor always does | YC always does TP on Mondays |
| **Rotation** | Activities doctors take turns doing | HTC1: FL → CL → NS |
| **Period** | A phase in the rotation cycle (1-6) | Period 1, Period 2... |
| **Cycle** | Pattern of who does what across periods | honeymoon_NS_noHDJ |
| **Template** | Ideal weekly pattern for an activity | HTC1 needs coverage all week |
| **Capacity** | Available time in a slot (max 4h) | Cs (3h) leaves 1h capacity |
| **Duration** | How long an activity takes | EMIT = 3 hours |
| **Time Slot** | 4-hour work period | 9am-1pm or 2pm-6pm |
| **Conflict** | Schedule problem to fix | Two doctors assigned same activity |
| **Workload** | Total work hours for a doctor | 36 hours this week |
| **Equity** | Fairness of workload distribution | 87% equity score |
| **Coverage** | Whether all activities are assigned | 100% coverage = perfect |
| **Skills** | Activities a doctor can perform | FL can do HTC1, HDJ, AMI |
| **Constraint** | Special requirement or limit | FL needs 2 TeleCs per week |

---

## 🎯 Summary: The Algorithm in Simple Terms

**Think of it like organizing a school schedule:**

1. **Phase 1** = Block out each teacher's fixed classes (backbone)
   - Mr. Smith always teaches Math Period 1
   - Mrs. Jones always has lunch duty

2. **Phase 2** = Assign rotating duties (like lab supervision)
   - Week 1: Mr. Smith supervises lab
   - Week 2: Mrs. Jones supervises lab
   - Week 3: Mr. Brown supervises lab

3. **Phase 3** = Fix conflicts and fill gaps
   - Two teachers assigned same duty? → Remove one
   - No one assigned playground duty? → Add someone
   - Mr. Smith has 50 hours, Mrs. Jones has 30? → Rebalance

**The result:** A complete, fair, working schedule where:
- Everyone's essential duties are covered ✅
- Rotating duties are shared fairly ✅
- No conflicts or gaps ✅
- Workload is balanced ✅

---

## 📧 Need More Help?

This document explains the **logic** behind the scheduling system. For:
- **Using the app:** See the user manual
- **Changing configurations:** See the technical documentation
- **Reporting bugs:** Contact the development team

**Remember:** The system is designed to handle complexity automatically. You don't need to understand every detail - just the concepts in this document to make informed decisions and troubleshoot basic issues!

---

**Document Version:** 1.0
**Last Updated:** 2025-01-10
**For:** MIMI Planning Application
**Audience:** Non-technical medical staff and administrators
