A logged-in user’s UI should be mobile-first and organized around four primary areas:

- **Nearby**
- **Report**
- **Activity**
- **Profile**

The interface should emphasize uncertainty, verification, and next actions rather than presenting incidents as confirmed truth.

## Core pages for every authenticated user

### 1. Sign in

Fields:

- Email or phone
- Password
- Sign in button
- Forgot-password link, if implemented
- Link to registration

States:

- Invalid credentials
- Suspended account
- Pending account
- Network failure
- Rate-limit warning

### 2. Registration

Fields:

- Name
- Email or phone
- Password
- Password confirmation
- Optional notification/location permissions

After registration, the user should enter the main nearby-incidents experience.

### 3. Nearby incidents

This is the default home screen.

It can include:

- A map with masked or approximate incident locations
- A list of nearby active incidents
- Incident state badges
- Distance bands rather than exact distances where appropriate
- Last updated time
- Filters by incident type and state
- Refresh control
- “Report something” primary action

Example cards:

```text
COMMUNITY REPORT — UNCONFIRMED
Possible road obstruction
Near Market Bridge
Reported 8 minutes ago
2 community reports
```

State labels should be understandable:

- **Unverified** — one or insufficient reports
- **Corroborated** — multiple independent firsthand reports, still unconfirmed
- **Conflicting** — relevant observations disagree
- **Confirmed by community anchor** — confirmed through an authorized community process
- **Stale** — no recent reaffirmation
- **Resolved** — marked resolved by an authorized user

The UI should avoid labels such as “safe,” “true,” “false,” or “threat probability.”

### 4. Public incident details

This page should work both with and without authentication.

Show:

- Cautious incident title
- Incident type
- Current state
- Approximate location or broad location label
- Approximate time reported
- Number of relevant reports
- Supporting and contradicting information
- Missing details
- Last updated time
- Timeline
- Available actions

Do not show:

- Reporter identity
- Exact reporter coordinates
- Raw private moderation notes
- AI prompts or provider metadata
- Private audit details
- Security fields

Actions for a logged-in resident:

- Submit firsthand witness information
- Submit active contradiction
- Submit hearsay tracking
- Report an additional observation
- Share a cautious summary, if sharing is implemented

The page should display a notice such as:

```text
This information reflects community reports. It does not establish that
the incident is true or that any location is safe.
```

### 5. Report submission

This should be accessible from the home screen and incident detail pages.

A multi-step form would work well on mobile.

#### Step 1: What happened?

Fields:

- Free-text description
- Incident type
- Source type:
  - Firsthand
  - Hearsay
  - Unknown
- Input type:
  - Text
  - Image
  - Screenshot
  - Audio

#### Step 2: Where?

Fields:

- Use current location
- Select location on map
- Location label
- Optional coordinates

The UI should explain that exact coordinates are used operationally but are not publicly exposed.

#### Step 3: When?

Fields:

- Event time
- “Happening now” option
- Approximate time option

#### Step 4: Review and submit

Show:

- What will be shared
- What will remain private
- Source type
- Location label
- Approximate location preview
- Submission button

After submission, show whether the report was:

```text
Linked to an existing incident
```

or:

```text
Used to create a new incident
```

The result page should include:

- Incident state
- Triage status
- Missing actionable details
- Suggested verification checks
- Link to the incident

Example:

```text
Report received

Your report was linked to an existing incident approximately 0.8 km away.

Current state:
UNVERIFIED

More detail could help:
- Exact landmark
- Whether the obstruction is still active
- Approximate number of people affected
```

The UI should not expose internal duplicate-cluster IDs or raw AI analysis.

### 6. Attestation form

From an incident page, the user can select one of three actions:

#### Firsthand witness

Fields:

- What did you personally observe?
- When did you observe it?
- Where did you observe it?
- Is it still active?
- Optional coordinates

#### Active contradiction

Fields:

- What contradicts the existing report?
- When did you observe this?
- Where did you observe it?
- What is currently different?

This should require recent observation details.

#### Hearsay tracking

Fields:

- What did you hear?
- Where did the information come from?
- Is it a forwarded message or direct conversation?
- Optional source description

The interface should make clear that hearsay tracking does not count as an independent firsthand confirmation.

After submission:

- Show confirmation of receipt
- Show the recalculated incident state
- Show whether the state changed
- Avoid showing a misleading “vote” or score

### 7. Activity or my contributions

This page shows the user’s own submissions without exposing unnecessary private information.

Sections:

- My reports
- My attestations
- Incidents I contributed to
- Recent state changes
- Pending triage results

Each item can show:

- Submission date
- Incident type
- Broad location
- Current incident state
- Triage status
- Whether it was linked or created a new incident

The user may see their own exact submitted location where operationally necessary, but it should not be displayed publicly.

### 8. My report details

This is a private view of a user’s own report.

It can include:

- Original report text
- Exact submitted coordinates, if needed
- Event time
- Triage result
- Missing details
- Moderation status
- Linked incident
- Submission history

It should not expose:

- Internal moderation notes
- Admin-only audit fields
- Other users’ private information
- Security tokens or internal provider data

### 9. Notifications

The notification page can show cautious community alerts for incidents within the configured public radius.

Notifications should only be generated when an incident transitions into:

- `CORROBORATED`
- `CONFIRMED`

Example:

```text
Community report — unconfirmed

Multiple independent firsthand reports describe a possible obstruction
near Market Bridge. Details remain unverified.
```

Do not notify on:

- New unverified reports
- Every new attestation
- Repeated recalculations
- `CONFLICTING`
- `STALE`
- `RESOLVED`

The notification UI should include:

- Incident state
- Approximate location
- Time
- “View details”
- “This does not establish that the location is unsafe”

### 10. Profile

The profile page should include:

- Name
- Email or phone
- Account role
- Account status
- Last login information
- Notification preferences
- Location permission preferences
- Sign out

Profile mutation fields:

- Update name
- Update contact information, if supported
- Change password, if implemented
- Update notification preferences

The user must not see or edit:

- Their own role
- Account permissions
- Moderation status fields
- Internal identifiers
- Security configuration

A role should be displayed read-only, for example:

```text
Account type: Resident
```

### 11. Help and safety guidance

A lightweight help page is valuable for this product.

It should explain:

- What each incident state means
- Difference between firsthand and hearsay reports
- How to submit useful details
- Why exact coordinates are protected
- Why the system does not declare locations safe
- How stale incidents work
- How to avoid forwarding panic-inducing claims
- How to contact moderators or administrators

## Role-specific pages

The ordinary resident UI should not expose moderation or administration features. Role-specific navigation can be added after login based on the authenticated user’s role.

### Reporter view

A reporter may receive:

- Enhanced report history
- Report-quality feedback
- Triage detail prompts
- Report follow-up status

They should not automatically receive moderation powers.

### Community-anchor view

Add:

- Anchor dashboard
- Incidents awaiting confirmation
- Nearby incidents requiring local review
- Confirm incident action
- Resolve incident action
- Confirmation history
- Operational location detail where necessary

Anchor actions should require a confirmation screen:

```text
Confirming this incident will mark it as community-confirmed.
This does not mean the location is safe.
```

### Moderator view

Add:

- Moderation queue
- Quarantined reports
- Report detail
- Approve report
- Reject report
- Quarantine report
- Duplicate/source-chain review
- Incident timeline
- Moderation history

Moderators may see exact coordinates and internal report metadata where operationally necessary, but the UI should clearly distinguish:

- Public content
- Internal moderation content
- Sensitive reporter details

### Admin view

Add:

- Admin dashboard
- User list
- User detail
- Change role
- Suspend/reactivate account
- Community-anchor management
- Application settings
- Audit logs
- Incident state-transition history
- Notification delivery records

Admin pages should include confirmation dialogs for destructive actions such as suspension, role changes, report rejection, and incident resolution.

## Suggested mobile navigation

For a resident:

```text
Nearby     Report     Activity     Profile
```

For a community anchor:

```text
Nearby     Report     Review      Profile
```

For a moderator:

```text
Incidents  Queue      Reports     Profile
```

For an administrator:

```text
Overview   Moderation Users       Settings
```

## Important UI behavior

The frontend should consistently:

- Show public incident reads without requiring authentication
- Require authentication before report submission or attestation
- Display masked or omitted coordinates
- Never imply that a report is verified merely because it appears in the system
- Clearly distinguish `CORROBORATED` from `CONFIRMED`
- Explain `CONFLICTING` without hiding disagreement
- Treat `STALE` as outdated rather than false
- Avoid exposing whether a specific person submitted a report
- Show missing details as requests for better information, not as accusations
- Handle rate limits, validation errors, expired tokens, and suspended accounts clearly

The first frontend milestone should be:

```text
Login
→ Nearby incidents
→ Incident details
→ Submit report
→ See automatic linking result
→ Submit attestation
→ View updated incident state
→ Profile and activity history
```

That flow covers the main logged-in user experience while leaving moderator, anchor, and admin dashboards as role-specific extensions rather than mixing them into the resident interface.