# New Zealand header clock

Acceptance criteria:
- Every public page displays the current date and time above the top-right language and search controls, labelled New Zealand.
- The clock uses Pacific/Auckland regardless of the visitor's timezone, including daylight saving and local date rollover.
- The clock refreshes automatically while the page is open; updates do not create screen reader announcements.
- At widths of 320, 390, 768, 1050 and 1440 pixels, the clock remains within the viewport without overlapping the logo. Language switching and search remain usable.

Coverage: component tests verify summer/winter offsets, midnight rollover and timer cleanup; the header browser test verifies responsive placement and control navigation.

The display uses the visitor's device clock. It is a current-time display, separate from content review or verification dates.
