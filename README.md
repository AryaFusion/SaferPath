# SaferPath

> **The fastest route is not always the safest route.**

SaferPath is a time-aware route planning platform that helps users make more informed travel decisions by providing additional context around their journey.

Instead of focusing only on distance and travel time, SaferPath considers factors such as lighting, activity, isolation, nearby help points, recent reports, data freshness, and other route conditions that may change with time.

## How SaferPath Works

The core flow of SaferPath is:

**Plan → Understand → Compare → Decide → Start Journey**

### 1. Plan

The user enters:

- Starting location
- Destination
- Travel mode
- Travel date
- Expected travel time

SaferPath then prepares available route options.

### 2. Understand

Each route is presented with relevant context, such as:

- Lighting conditions
- Activity around the route
- Nearby help points
- Recent user reports
- Route isolation
- Data freshness
- Confidence of available information

### 3. Compare

Users can compare different route options and understand how their context differs.

SaferPath does not simply provide an unexplained safety score. Instead, it focuses on showing the information and evidence behind the route context.

### 4. Decide

The user chooses the route that best fits their journey.

SaferPath provides information and context, while the final decision remains with the user.

### 5. Start Journey

Once a route is selected, the user can start their journey.

During an active journey, SaferPath can provide features such as:

- Current journey status
- Optional check-in
- Nearby support points
- Route deviation awareness

If the user moves away from the planned route, SaferPath can ask:

> **"You're outside your planned route. Are you okay?"**

The user can then choose the appropriate action.

## Reports

SaferPath also allows users to submit structured observations about route conditions.

Examples include:

- Poor lighting
- Low activity or isolated areas
- Road or infrastructure issues
- Help-point issues
- Recent safety-related observations

These reports can be reviewed and may contribute to route context for future journeys.

## Key Idea

A route is not always experienced the same way at every time of day.

A journey at **6 PM** can have different conditions from the same journey at **11 PM**.

SaferPath adds this time-aware context to route planning so that users can better understand the conditions around their journey.

## Product Flow

```text
User
  ↓
Plan a Journey
  ↓
Enter Origin & Destination
  ↓
Select Travel Mode
  ↓
Select Date & Expected Time
  ↓
View Route Options
  ↓
Understand Route Context
  ↓
Compare Routes
  ↓
Choose a Route
  ↓
Start Journey
  ↓
Optional Check-In
  ↓
Active Journey
  ↓
Help Nearby / Route Deviation Support
  ↓
End Journey
  ↓
Trip History
