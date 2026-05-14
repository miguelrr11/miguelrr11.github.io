Manual de mi proyecto hecho con Claude

# ProcRoadv2 — Technical Manual

A p5.js interactive road editor and traffic simulator. The user draws a road network manually; the system computes lane geometry, intersection shapes, and runs cars with an Intelligent Driver Model.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [ID System](#2-id-system)
3. [Core Data Model](#3-core-data-model)
4. [The Road Update Pipeline](#4-the-road-update-pipeline)
5. [Intersection Geometry](#5-intersection-geometry)
6. [Rendering System](#6-rendering-system)
7. [Spatial Index (RTree / GraphIndex)](#7-spatial-index-rtree--graphindex)
8. [Car Simulation](#8-car-simulation)
9. [Traffic Light System](#9-traffic-light-system)
10. [Pathfinding](#10-pathfinding)
11. [Tool — Editor and Input](#11-tool--editor-and-input)
12. [Menu, Buttons, Sliders](#12-menu-buttons-sliders)
13. [OSM Import](#13-osm-import)
14. [Save / Load](#14-save--load)
15. [Key Constants and Tunables](#15-key-constants-and-tunables)
16. [File Map](#16-file-map)

---

## 1. Architecture Overview

```
sketch.js
  └── Tool
        ├── Road                 ← the data model
        │     ├── nodes          (Map<id, Node>)
        │     ├── segments       (Map<id, Segment>)
        │     ├── paths          (Map<"nodeA-nodeB", Path>)
        │     ├── connectors     (Map<id, Connector>)
        │     ├── intersecSegs   (Map<id, InterSegment>)
        │     ├── intersections  (Map<nodeID, Intersection>)
        │     ├── TLSs           (Map<intersectionID, TrafficLightSystem>)
        │     └── graphIndex     (GraphIndex — two R-trees)
        ├── CarManager
        │     └── cars[]         (Car[])
        └── Menu
              ├── Button[]
              └── Slider[]
```

`sketch.js` has only `setup()` and `draw()`. Every frame, `tool.update()` and `tool.show()` drive everything.

---

## 2. ID System

All object IDs are short strings drawn from a 94-character alphabet (no `-` or `_`, which are reserved for compound keys). `getNextID(id)` in `Road.js` increments the base-94 number. IDs are assigned at creation and never change.

The design principle: **never store object references inside other objects — store IDs and resolve them through the Road maps.** Direct object references like `segment.fromNode` are cached as a performance optimization on top of this, but the IDs are always the source of truth.

Path IDs are `"nodeA-nodeB"` strings, not from the ID pool. InterSegment `fromtoKey` is `"connectorA_connectorB"`.

---

## 3. Core Data Model

### 3.1 Node (`Node.js`)

A point in 2D world space. Nodes are intersections — every segment starts and ends at a node.

| Field | Meaning |
|---|---|
| `id` | unique string ID |
| `pos` | `{x, y}` world position |
| `incomingSegmentIDs[]` | IDs of segments whose `toNodeID` is this node |
| `outgoingSegmentIDs[]` | IDs of segments whose `fromNodeID` is this node |
| `incomingSegments[]` | same, as direct references (cache) |
| `outgoingSegments[]` | same |

### 3.2 Segment (`Segment.js`)

One directed lane between two nodes. A road with 2 lanes in each direction between nodes A and B has **4 segments**.

| Field | Meaning |
|---|---|
| `fromNodeID / toNodeID` | the two endpoint nodes |
| `visualDir` | `'for'` or `'back'` — which visual direction this lane goes (used for coloring) |
| `fromPos / toPos` | **trimmed** world positions (after intersection trimming) |
| `originalFromPos / originalToPos` | untrimmed positions (used during trim computation) |
| `dir` | angle in radians from `fromPos` to `toPos` |
| `corners[]` | flat `[x0,y0, x1,y1, x2,y2, x3,y3]` corners of the lane rectangle |
| `corners16[]` | same but wider (for sidewalk base) |
| `fromConnector / toConnector` | the Connectors that cap this segment at each node |
| `cars[]` | ordered array of cars currently on this segment |
| `path` | reference to the owning Path |

`constructCorners()` — recomputes the 4 lane corners and yield line positions from `fromPos/toPos`.  
`createArrows()` — recomputes arrow tip positions evenly spaced along the segment.  
`carAheadInSafeDistance(dist, segTrav)` — returns the closest car ahead of `segTrav` within `dist`.

### 3.3 Path (`Path.js`)

Groups all segments that run between the **same pair of nodes** (regardless of direction). A 4-lane bidirectional road is one Path with 4 Segments.

| Field | Meaning |
|---|---|
| `nodeA / nodeB` | the two endpoint node IDs |
| `segmentsIDs` | a `Set` of segment IDs |
| `segments[]` | same as direct references |
| `id` | `"nodeA_nodeB"` |

`constructRealLanes()` — **the most important function in Path**. Reads the node positions and the number of segments, then assigns each segment its actual offset `fromPos/toPos` by spreading all lanes perpendicular to the road direction. Lanes going from nodeA→nodeB sit on one side; lanes going nodeB→nodeA on the other. Also calls `setSegmentDrawOuterLinesLogic()` to decide which lane edge lines are dashed (inner lane boundary) vs solid (outer road edge).

`orderSegmentsByDirection()` — sorts the segments Set so that forward-direction lanes come first. This ordering controls the left-to-right lane layout.

### 3.4 Connector (`Connector.js`)

A point at the tip of a segment where it meets a node. Every segment has a `toConnector` (the "enter" connector where it arrives at an intersection) and the segment leaving the intersection has a `fromConnector` (the "exit" connector).

| Field | Meaning |
|---|---|
| `type` | `'enter'` (at the arriving tip) or `'exit'` (at the departing tip) |
| `incomingSegmentIDs[]` | the Segment(s) feeding into this connector |
| `outgoingSegmentIDs[]` | for `enter` connectors: IDs of InterSegments going out; for `exit` connectors: ID of the next Segment |
| `nodeID` | which intersection this belongs to |
| `dirs` | `{leftTurn, rightTurn, straight}` booleans used for road markings |

`constructDirections()` — computes `dirs` by measuring the angle between the incoming segment and each outgoing segment.  
`getOutgoingActiveIntersegs()` — returns only active InterSegment IDs (respects TLS + user-disabled connections).  
`chooseOutRandom()` — picks a random active outgoing intersegment (used by CarManager for route building).

### 3.5 InterSegment (`InterSegment.js`)

A bezier curve connecting an `enter` Connector to an `exit` Connector **inside** an intersection. It is what a car drives through when crossing a junction.

| Field | Meaning |
|---|---|
| `fromConnectorID / toConnectorID` | the two connectors |
| `bezierPoints[]` | flat `[x0,y0, x1,y1, ...]` sampled bezier points |
| `active` | boolean — can be toggled by the user to block a turn |
| `cars[]` | cars currently traversing this intersegment |

`getPos(travelled)` / `getDir(travelled)` — interpolate position/angle along the bezier curve given a travelled distance.

### 3.6 Intersection (`Intersection.js`)

A data container that groups everything belonging to one node's junction area.

| Field | Meaning |
|---|---|
| `id` | same as `nodeID` |
| `connectors[]` | all Connectors at this node |
| `intersecSegs[]` | all InterSegments crossing this node |
| `paths[]` | all Paths connected to this node |
| `outline[]` | flat point array: the outer edge of the junction (road surface boundary) |
| `outline16[]` | same but wider (sidewalk base boundary) |
| `edges[]` | the curved edge lines between road and sidewalk |
| `innerEdges[]` | bezier curves separating bidirectional flow |
| `innerLaneEdges[]` | dashed bezier curves separating same-direction lanes crossing the junction |
| `TLS` | TrafficLightSystem instance, if any |

`calculateOutlinesIntersection()` — calls `getOutline()` to compute the visual boundary polygons.  
`getOutline()` — the core geometry function. Collects all segment endpoint corners, sorts them clockwise around the node, then builds bezier curves between consecutive pairs to form a smooth junction outline.  
`calculateInnerEdges()` — computes the center divider bezier lines.  
`getActivenessMap()` — returns a `Map<"fromSegID_toSegID", bool>` that records which turns are enabled; used to restore turn state after a road rebuild.  
`constructTLphases()` — see Section 9.

---

## 4. The Road Update Pipeline

This is the most important flow to understand. Every structural edit (add segment, delete node, move node) ultimately calls `updateRoad`.

```
addSegment / deleteSegment / moveNode
        │
        ▼
   updateRoad([nodeA, nodeB], path?)
        │
        ├─► constructLanesOfPath(path)
        │       └── path.constructRealLanes()   ← assigns fromPos/toPos to each segment
        │           (also updates graphIndex edges)
        │
        └─► for each node in [nodeA, nodeB]:
                trimSegmentsAtIntersection(nodeID)
                        │
                        ├─► findIntersectionsOfNodev2(nodeID)
                        │       └── computes how far each path should be trimmed
                        │           (finds intersection of lane boundary lines)
                        │
                        ├─► trims segment fromPos/toPos proportionally
                        │   (checks the other-end trim to avoid overlap)
                        │
                        └─► connectIntersection(nodeID)
                                └── creates all Connectors and InterSegments
                                    for this node, with bezier curves
```

### 4.1 `findIntersectionsOfNodev2`

For each pair of paths meeting at the node, it intersects their lane boundary lines (including the wider `corners16` outlines) to find where they geometrically cross. The **farthest** such intersection point per path is the trim distance. This gives the "gap" before the junction where the lanes visually open up.

### 4.2 `trimSegmentsAtIntersection`

After computing trim distances for both ends of every segment, it checks whether the two trims would consume more length than the segment has. If so, it scales them proportionally so both ends fit.

### 4.3 `connectIntersection`

Rebuilds all Connectors and InterSegments for a node from scratch. For every (incoming segment, outgoing segment) pair it:
1. Creates or reuses `enter` and `exit` Connectors.
2. Builds a bezier curve between the `toPos` of the incoming segment and the `fromPos` of the outgoing segment (using the segment directions as tangent guides).
3. Creates an InterSegment storing the bezier points.
4. Restores `active` state from the `activenessMap` saved before the rebuild.

### 4.4 `setPaths`

Full recompute of everything (paths, lanes, intersections). Used after loading from localStorage. Slower than incremental `updateRoad`.

---

## 5. Intersection Geometry

The visual junction area (the grey polygon at a node) is built by `getOutline()`:

1. For each Path connected to the node, grab the two outermost corner points (one from the first segment, one from the last segment in the path at that node side).
2. Sort all collected points clockwise around the node center.
3. Pair consecutive points and draw a bezier curve between each pair, using the segment direction as a tangent. This gives the smooth curved edges.
4. The wider version (`is16 = true`, using `corners16`) gives the sidewalk base; the narrower version gives the road surface.

`calculateInnerEdges()` draws the center-line bezier between bidirectional lanes crossing the intersection.  
`calculateInnerLaneEdges()` draws dashed beziers for same-direction lane separators inside the intersection (only for 2-path nodes).

---

## 6. Rendering System

`Road.showWays()` is the main visual renderer, called from `Tool.show()`. It uses zoom-dependent LOD:

| Zoom | What is drawn |
|---|---|
| ≤ 0.05 | Only thin white lines (showMain) |
| > 0.05 | Sidewalk base + road surface polygons |
| > 0.1 | Path way shapes |
| > 0.18 | Outer/inner edge markings, yield lines, nodes |
| > 0.35 | Direction arrows, lane names |

The rendering order (back to front):
1. Sidewalk base (wider polygon, grey) — paths + intersections
2. Road surface (narrower polygon, darker grey) — intersections then paths
3. Outer edge lines (white) — intersection curves
4. Inner edge lines — center dividers
5. Yield markings (thick lines at intersection entries)
6. Direction arrows

Debug overlays (toggled via Menu):
- `SHOW_PATHS` — colored lines with arrows for each segment
- `SHOW_LANES` — colored lane rectangles (blue = forward, red = back)
- `SHOW_CONNECTORS` — circles at connector positions
- `SHOW_INTERSECSEGS` — bezier curves inside intersections
- `SHOW_NODES` — node circles
- `SHOW_GRAPH` — R-tree bounding boxes
- `SHOW_CAR_DEBUG` — car routes and detection radii, TLS phase colors

Only elements within the current viewport are rendered. `Tool.updateElementsInView()` queries the GraphIndex and builds `pathsInView` and `intersectionsIDsInView` to pass to the draw calls.

---

## 7. Spatial Index (RTree / GraphIndex)

`RTree.js` implements a standard R-tree with quadratic splitting. Used for:
- Finding the node under the mouse cursor
- Finding the closest segment to a point (for splitting, car placement)
- Culling elements outside the viewport

`GraphIndex` wraps **two** R-trees — one for nodes and one for edges — so their ID pools don't collide. Key methods used by Road:

| Method | Used for |
|---|---|
| `insertNode / deleteNode` | whenever a node is added/removed/moved |
| `insertEdge / deleteEdge` | whenever a segment's positions change |
| `searchPoint(x, y)` | hover detection |
| `search(rect)` | viewport culling |
| `nearestEdges(x, y, k)` | finding closest segment to cursor |

---

## 8. Car Simulation

### 8.1 CarManager (`CarManager.js`)

Manages the car fleet. Each frame:
1. `setWorldPos()` on all cars (updates cached screen position).
2. `update()` on all cars (physics step).
3. `checkRoute()` — if a car has reached the end of its route, generates a new one.

`setRoute(car)` — builds a route starting from the car's current segment. At each step it picks a random active outgoing segment via `connector.chooseOutRandom()`. The route alternates: Segment → InterSegment → Segment → …

### 8.2 Car (`Car.js`)

A car tracks its current segment ID and how far it has travelled along it (`segTrav`). It toggles `isOnIntersection` each time it crosses a Connector.

**Movement — Intelligent Driver Model (IDM):**

Each frame the car computes acceleration based on:
- `aFree` — free-road term: accelerate toward `maxSpeed` with a quartic S-curve.
- If there's an obstacle ahead, compute `sStar` (desired gap) and apply the full IDM braking formula.

Obstacles checked (closest wins):
1. `carAhead()` — scans forward through the route up to `DETECT_DISTANCE` looking for a leading car.
2. `carIntersecting()` — if on an InterSegment, checks cars on parallel intersegments converging to the same exit Connector.
3. `checkRedLightFurther()` — scans the route for a red TLS within `DETECT_DISTANCE`.

The segment's `cars[]` array is kept ordered by `segTrav` so `carAheadInSafeDistance` is an O(n) scan with an early exit.

`changeSegment(old, new)` — removes the car from the old segment's list and appends it to the new one, flips `isOnIntersection`.

The route is a flat array of alternating Segment and InterSegment IDs. `routeIndex` points to the next segment to enter when the car finishes its current one.

---

## 9. Traffic Light System

### 9.1 Phase generation (`Intersection.constructTLphases`)

Only built for intersections with > 2 paths and > 1 intersegment.

1. **Collision detection** — checks every pair of active InterSegments for bezier curve intersections (`checkSegmentCollision`). Two intersegments sharing the same `fromConnector` are never in conflict.
2. **Conflict graph** — builds a map of which intersegments conflict with which.
3. **Greedy phase assignment** — sorts movements by number of conflicts (most-conflicted first), then greedily assigns each to the first compatible phase. A second pass tries to add remaining compatible movements to existing phases.
4. **Non-conflicting movements** — any intersegment not in any conflict is added to all phases (it can always go).

### 9.2 `TrafficLightSystem` (`TrafficLightSystem.js`)

| Field | Meaning |
|---|---|
| `phases[][]` | array of phases, each a list of allowed InterSegment IDs |
| `currentPhaseIndex` | which phase is active |
| `phaseDuration` | frames per phase (5.5 × 60) |
| `yellowDuration` | frames of yellow (2 × 60) |
| `isInYellow` | during yellow, ALL intersegments are considered red |

`isRed(intersecSegID)` — returns `true` if yellow, or if the segment is not in the current phase.  
Cars check `isRed` via `checkRedLightFurther()` and brake accordingly.

---

## 10. Pathfinding

Two A* implementations in `Pathfinding.js`:

**`Astar(startNodeID, goalNodeID, road)`** — node-level A*. Returns a list of node IDs. Does not respect lane directionality. Not used in normal operation.

**`AstarConnectors(startConnID, goalConnID, road)`** — connector-level A*. Traverses the Connector graph (exit connector → intersegment → enter connector → segment → exit connector → …). Respects active/inactive intersegments. Returns a list of Connector IDs.

The Tool uses `AstarConnectors` when the user sets start/end points via "Set Start / Set End" buttons. The found path is displayed as a colored overlay.

---

## 11. Tool — Editor and Input

`Tool.js` is the top-level controller. It holds the state machine and all event handlers.

### 11.1 State machine

`state.mode` can be:
- `creating` — click to place/extend nodes; click on existing node to start a segment from it.
- `deleting` — click nodes or segments to delete them.
- `movingNode` — drag nodes; double-click a node to open intersection fine-tuning.
- `selecting` — drag a box to select nodes for group-move, copy, paste.
- `settingStart` / `settingEnd` — click to place pathfinding endpoints.

### 11.2 Creating segments

When in `creating` mode:
- First click: place a new node (or snap to existing nearby node).
- Second click: place another node and call `road.addSegment(prevNodeID, newNodeID)` — this also creates `nForLanes` forward segments and `nBackLanes` backward segments as a batch.
- Right-click: finish the current chain.

The `CSmode` (Curved Segments) flag routes segment creation through a control-point picker to create bezier-interpolated intermediate nodes.

### 11.3 Zoom and pan

Stored as `tool.xOff, tool.yOff, tool.zoom`. Mouse wheel zooms around the cursor. Middle-drag pans. There is a smooth lerp mode for animated centering (`center()`).

`getRelativePos(screenX, screenY)` converts screen coordinates to world coordinates accounting for zoom and offset.

### 11.4 Intersection fine-tuning

Double-clicking a node opens it in the `selectedIntersection` state. The user can then click on a Connector to select it, then click on an exit Connector to toggle the InterSegment between them active/inactive. This persists through road rebuilds via `getActivenessMap()`.

---

## 12. Menu, Buttons, Sliders

`Menu.js` constructs all UI elements in its constructor. No retained-mode updates — buttons re-evaluate `updateLabel()` and `enabled()` every frame.

**Button** — clickable rectangle. Can animate collapse/uncollapse (lerp). `disabled` greys it out without hiding it. `updateLabel` is a callback called each frame to dynamically update text (used for FPS display, zoom level, etc).

**Slider** — horizontal drag slider. Calls `onChange(value)` in real time. Double-click resets to initial value. Optional `snap` point that highlights and snaps near a reference value.

Sliders that affect road geometry (`Lane Width`, `Bezier Length`, `Intersec Rad`, `Tension Min/Max`) call `road.setPaths()` immediately on change — full recompute.

---

## 13. OSM Import

The "OSM Beta" button fetches road data from the Overpass API for the user's current geolocation within a configurable radius. The result is processed asynchronously in batches (`OSM_QUEUE_UPDATE_ITERS_PER_FRAME` nodes per frame) to avoid blocking the UI.

Flow:
1. `fetchOverpassWithRetry` — queries Overpass, tries multiple mirror servers on failure.
2. `constructRoadFromOSMAsync(data, button)` — parses the OSM JSON, enqueues nodes into `state.OSMqueue`.
3. Each frame, `Tool.update()` processes the queue: creates Road nodes and segments, projecting lat/lon to local pixel coordinates via `SCALE_FACTOR_OSM`.

---

## 14. Save / Load

`saveToLocalStorage()` — serializes nodes and segments (via their `export()` methods) to JSON and stores it with p5's `storeItem()`.

`loadFromLocalStorage()` — reconstructs nodes and segments from the saved JSON, then calls `road.setPaths()` to recompute all derived state (paths, intersections, connectors, etc).

---

## 15. Key Constants and Tunables

| Constant | Default | Meaning |
|---|---|---|
| `LANE_WIDTH` | 30 | Width of one lane in pixels |
| `BIG_LANE_WIDTH` | 48 | Sidewalk base width (1.6 × lane) |
| `NODE_RAD` | 25 | Visual and hit-test radius of nodes |
| `OFFSET_RAD_INTERSEC` | 25 | Extra gap added to computed trim distances |
| `LENGTH_SEG_BEZIER` | 12 | Bezier sample interval for intersegments |
| `TENSION_BEZIER_MAX` | 0.75 | Control-point strength for bezier curves |
| `MIN_ANGLE_DEG` | 20 | Segment pairs closer to parallel than this are skipped during trimming |
| `MAX_REASONABLE_TRIM` | 200 | Intersection points farther than this from the node are discarded |
| `IDM_A` | 0.07 | Max comfortable car acceleration |
| `IDM_B` | 0.25 | Max comfortable car deceleration |
| `IDM_T` | 16 | Desired time headway in frames |
| `IDM_S0` | 22 | Minimum bumper-to-bumper gap at standstill |
| `DETECT_DISTANCE` | 130 | Look-ahead distance for car collision detection |
| `MIN_ROUTE_LEN` | 8 | Minimum number of segments in a car's pre-planned route |

---

## 16. File Map

| File | Responsibility |
|---|---|
| `sketch.js` | p5.js entry point, `setup` / `draw` |
| `Road.js` | Top-level data model, all structural operations, constants |
| `Node.js` | Node class |
| `Segment.js` | Segment class, lane corner geometry, arrows |
| `Path.js` | Path class, `constructRealLanes`, lane drawing logic |
| `Connector.js` | Connector class, direction logic, random route choice |
| `InterSegment.js` | InterSegment class, bezier traversal |
| `Intersection.js` | Intersection class, outline geometry, TLS phase generation |
| `TrafficLightSystem.js` | TLS class, phase cycling, `isRed` |
| `Car.js` | Car class, IDM physics, look-ahead scanning |
| `CarManager.js` | Fleet management, route generation |
| `Pathfinding.js` | A* on nodes and on connectors |
| `RTree.js` | Generic R-tree and `GraphIndex` wrapper |
| `Tool.js` | Input handling, editor state machine, zoom/pan, OSM import, save/load |
| `Menu.js` | UI elements: `Menu`, `Button`, `Slider`, Overpass fetch helper |
| `Utils.js` | Math helpers (not covered here) |
