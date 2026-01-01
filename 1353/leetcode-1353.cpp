/**
 * Copyright (c) 2026 https://github.com/ori88c/
 * All rights reserved.
 *
 * This code may NOT be copied, modified, or translated to other languages.
 * For self-study purposes only.
 *
 * See LICENSE file or visit https://github.com/ori88c/ for full terms.
 */

#include <cstdint>
#include <vector>
#include <queue>
#include <algorithm>
#include <functional>

/**
 * Event
 * C++ default three-way comparison compares fields in declaration order.
 * We declare start before end so comparisons order by start, then by end.
 */
struct Event {
  uint32_t start;
  uint32_t end;

  auto operator<=>(const Event& other) const = default;
};

/**
 * MinHeapElement
 * Heap key prioritizes smaller end;
 */
struct MinHeapElement {
  uint32_t end;

  // Note: a real-life solution in which we also return a mapping from event to attended
  // day, would require storing the original index of the event. In the context of this
  // problem, I will comment it out for brevity.
  // size_t original_event_index;

  auto operator<=>(const MinHeapElement&) const = default;
};

/**
 * Compute maximum number of attendable events.
 *
 * - Full proof and detailed reasoning: see 1353/README.md
 * - Algorithm outline (short):
 *   1) Sort events by ascending start.
 *   2) Iterate days in ascending order.
 *   3) Maintain a min-heap of overlapping events keyed by end; add all events that start at currDay.
 *   4) Evict heap entries with end < currDay.
 *   5) Allocate exactly one event per day (the smallest end), then advance currDay.
 *   6) If the heap is empty, jump currDay to the next event start (skips gaps).
 *
 * - Edge case motivating step 5:
 *   [1,10], [1,10], [2,2] — if multiple allocations were done in one loop pass, [2,2] could be
     skipped before it is added. One allocation per iteration ensures the tight interval is chosen
     when currDay = 2.
 *
 * @param events Input events [start, end].
 * @return Maximum number of attendable events (one day per event).
 */
uint32_t getMaxAttendableEvents(const vector<Event>& events) {
  if (events.empty()) {
    return 0UL;
  }

  // Sort events by ascending start.
  auto eventsAscByStart{ events };
  sort(eventsAscByStart.begin(), eventsAscByStart.end(), std::less<Event>());

  uint32_t attendedEvents = 0;

  // Min-heap of events overlapping currDay, prioritized by earliest end.
  // If we needed event->day mapping, we would store indices as well.
  using MinHeap = priority_queue<
    MinHeapElement,
    vector<MinHeapElement>,
    std::greater<MinHeapElement>()
  >;
  MinHeap overlappingEvents;

  auto eventIter = eventsAscByStart.cbegin();
  uint32_t currDay = eventIter->start; // Monotonic; guarantees unique day assignments per event.

  // Main loop.
  while (eventIter != eventsAscByStart.cend() || !overlappingEvents.empty()) {
    // Evict events that ended before currDay.
    while (!overlappingEvents.empty() && overlappingEvents.top().end < currDay) {
      overlappingEvents.pop();
    }

    // If the heap is empty, jump to the next event start.
    // Relevant when there’s a gap (e.g., [1,10],[4,5]): after processing [1,10],
    // currDay = 2 doesn’t overlap [4,5], so we jump to the next start.
    if (overlappingEvents.empty() && eventIter != eventsAscByStart.cend()) {
      currDay = eventIter->start;
    }

    // Add all events that start at currDay.
    while (eventIter != eventsAscByStart.cend() && eventIter->start == currDay) {
      overlappingEvents.push(MinHeapElement{ eventIter->end });
      ++eventIter;
    }

    // Allocate at most one event for currDay (earliest end wins).
    // Do not be tempted to convert this `if` to a `while`: multiple allocations per pass can
    // skip tight intervals (see [1,10],[1,10],[2,2]).
    if (!overlappingEvents.empty()) {
      // In a real-world scenario, you’d also record which event was assigned to currDay.
      overlappingEvents.pop();
      ++attendedEvents;
      ++currDay;
    }
  }

  return attendedEvents;
}
