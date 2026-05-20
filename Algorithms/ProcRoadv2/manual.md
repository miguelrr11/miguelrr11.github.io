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
17. [Expanding the Project — GPU Memory Contract](#17-expanding-the-project--gpu-memory-contract)

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

Rendering is split into two layers: **WebGL** for all filled polygons (road surfaces, sidewalk bases) and **p5.js** for everything else (edge lines, arrows, debug overlays).

### 6.1 WebGL Renderer (`Renderer.js`)

`Renderer` manages a single large VBO + IBO pre-allocated on the GPU at startup:

| Constant | Value | Meaning |
|---|---|---|
| `MAX_VERTICES` | 2 500 000 | Maximum vertices in the VBO |
| `MAX_INDICES` | 7 500 000 | Maximum indices in the IBO |
| `FLOATS_PER_VERTEX` | 2 | Only x, y — color is a per-draw-call uniform |

The GPU buffers are never reallocated. All edits are `gl.bufferSubData` on exact sub-ranges.

#### Polygon handles

`addPolygon(points, localIndices)` uploads a triangulated polygon and returns a **handle**:

```js
{ vertexOffset, vertexCount, indexOffset, indexCount }
```

This handle is the only way to reference the polygon later. Path and Intersection each store `this.polygon` and `this.polygonBase` as their handles.

`removePolygon(handle)` writes degenerate indices (all pointing to the same vertex, so area = 0) over the polygon's IBO range, then returns the vertex and index slots to the free-list.

#### Free-list memory management

Freed slots are grouped by exact size in two `Map<size, offset[]>`:
- `freeVertexSlots` — vertex slots available for reuse
- `freeIndexSlots` — index slots available for reuse

When `addPolygon` is called, it first looks for a free slot of the **exact same size**. If none exists, it bumps the cursor forward. The cursor (`vertexCursor`, `indexCursor`) is a high-watermark — it never goes down.

**Consequence:** if a polygon changes size (e.g. intersection shape changes), the old slot goes into the free-list at its original size and a new slot at the new size is allocated from the cursor. The old slot can only be recycled by a future polygon of the exact same vertex/index count.

#### Memory counters

| Field | Meaning |
|---|---|
| `vertexCursor` | High-watermark — total GPU range ever used |
| `wastedVertices` | Vertices currently sitting in the free-list |
| `active = cursor - wasted` | Vertices belonging to live polygons |

`renderer.debugMemory()` prints a full breakdown to the console. Call it from DevTools at any time.

#### Batch draw calls

`beginFrame(zoom, xOff, yOff)` — clears the canvas and uploads camera uniforms.

`drawMeshes(visibleMeshes, color)` — sorts meshes by `indexOffset`, then merges **contiguous** IBO ranges into a single `drawElements` call. This means polygons added in sequence are drawn in one call with no overhead.

#### Frame-loop integration (Tool.js)

Every frame, before drawing:

```js
// 1. Execute all queued removes
for (const handle of road.pendingRemoveHandles)
    renderer.removePolygon(handle)
road.pendingRemoveHandles.length = 0

// 2. Rebuild all dirty polygons (each does its own remove→add internally)
for (const obj of road.dirtyPolygons)
    obj.constructPolygon()
road.dirtyPolygons.clear()
```

`pendingRemoveHandles` — array on `Road`. Any code that destroys a path or intersection must push its GPU handles here (or use `_freePath` / the intersection cleanup in `deleteNode`, which do it automatically).

`dirtyPolygons` — `Set` on `Road`. Any code that changes a path or intersection's geometry must add the object here. `constructPolygon()` always does `removePolygon` on the existing handle first, then `addPolygon`.

### 6.2 p5.js Overlay Layer

`Road.showWays()` is called from `Tool.show()` after the WebGL pass. It uses zoom-dependent LOD:

| Zoom | What is drawn |
|---|---|
| ≤ 0.05 | Only thin white lines (showMain) |
| > 0.05 | (WebGL handles filled polygons) |
| > 0.18 | Outer/inner edge markings, yield lines, nodes |
| > 0.35 | Direction arrows, lane names |

Rendering order (back to front):
1. **WebGL** — sidewalk base polygons (paths + intersections)
2. **WebGL** — road surface polygons (intersections then paths)
3. **p5** — outer edge curves (white lines)
4. **p5** — inner edge dividers
5. **p5** — yield markings
6. **p5** — direction arrows

Debug overlays (toggled via Menu):
- `SHOW_PATHS` — colored lines with arrows for each segment
- `SHOW_LANES` — colored lane rectangles (blue = forward, red = back)
- `SHOW_CONNECTORS` — circles at connector positions
- `SHOW_INTERSECSEGS` — bezier curves inside intersections
- `SHOW_NODES` — node circles
- `SHOW_GRAPH` — R-tree bounding boxes
- `SHOW_CAR_DEBUG` — car routes and detection radii, TLS phase colors

Only elements within the current viewport are rendered. `Tool.updateElementsInView()` queries the GraphIndex and builds `pathsInView` and `intersectionsInView` to pass to the draw calls.

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
| `Renderer.js` | WebGL renderer — VBO/IBO, free-list, polygon handles, batch draw |

---

## 17. Expanding the Project — GPU Memory Contract

This section exists because the GPU memory system has one rule that **must not be broken**: every polygon added with `addPolygon` must eventually be removed with `removePolygon`, and it must happen **exactly once**. Violating this leaks GPU address space permanently (the cursor never goes back). Double-freeing corrupts the free-list.

### 17.1 The two queues on Road

```
road.pendingRemoveHandles  — []      array of GPU handles to free this frame
road.dirtyPolygons         — Set()   set of Path/Intersection objects to rebuild this frame
```

The frame loop in `Tool.js` processes them in order: **removes first, then rebuilds**. This ordering matters — `constructPolygon` does its own `removePolygon` on the existing handle, so if you put something in both queues, the polygon would be freed twice. Only use `pendingRemoveHandles` for objects that are being **destroyed** (no rebuild follows). Use `dirtyPolygons` for objects that are being **updated** (geometry changed, rebuild follows).

### 17.2 Rule: never delete a Path without calling `_freePath` first

`Road._freePath(path)` does three things:
1. Pushes `path.polygon` to `pendingRemoveHandles` (if not null)
2. Pushes `path.polygonBase` to `pendingRemoveHandles` (if not null)
3. Removes `path` from `dirtyPolygons` (prevents a zombie rebuild after destruction)

**Every place in Road.js that removes a path from `this.paths` must call `_freePath` first.** The existing helpers already do this:

| Function | Calls `_freePath`? |
|---|---|
| `deletePathByNodeID` | ✓ |
| `deletePathExact` | ✓ |
| `checkAndDeletePath` | ✓ |
| `updateRoad` (empty path branch) | ✓ |

If you add a new code path that does `this.paths.delete(key)` directly, you must call `_freePath(path)` on the path object **before** deleting it. Same rule applies if you replace a path object in the map with a new one.

### 17.3 Rule: never delete an Intersection without freeing its GPU handles

When removing an intersection from `this.intersections`, always do **both**:

```js
this.dirtyPolygons.delete(intersection)           // 1. cancel any pending rebuild
this.pendingRemoveHandles.push(...intersection.getAllPolygons())  // 2. free GPU slots
this.intersections.delete(nodeID)                 // 3. then remove from map
```

The existing code in `deleteNode` and `updateRoad` already follows this pattern. If you add a new code path that removes intersections, copy this exact sequence.

`getAllPolygons()` is defined on `Intersection` (not on `Path`). It returns `[this.polygon, this.polygonBase]` filtering out nulls. A freshly created intersection with no `constructPolygon` call yet will have both as null — `getAllPolygons()` returns `[]`, which is safe to spread into `pendingRemoveHandles`.

### 17.4 Rule: "update geometry" goes through `dirtyPolygons`, not manual calls

When the geometry of an existing path or intersection changes (node moved, lane count changed, intersection shape changed), do:

```js
road.dirtyPolygons.add(pathOrIntersection)
```

**Do not** call `constructPolygon()` directly. The frame loop calls it once at the end of the frame. Calling it in the middle of an update risks operating on stale geometry.

`constructPolygon()` is written to be idempotent: it calls `removePolygon` on the existing handle before calling `addPolygon`. So adding an object to `dirtyPolygons` twice in the same frame is safe — `constructPolygon` runs once (the Set deduplicates), and the double-remove is handled by the remove→add sequence inside `constructPolygon` itself.

### 17.5 Rule: new geometry object types follow the same pattern

If you add a new class that renders filled polygons (e.g. a building, a parking lot, a crosswalk), it must:

1. Store its handle(s) as `this.polygon = null` initially.
2. Implement `constructPolygon()` that does `removePolygon` on any existing handle, then `addPolygon`.
3. Implement `getAllPolygons()` returning its handles (filtering nulls).
4. Any code that destroys one of these objects must call `road.pendingRemoveHandles.push(...obj.getAllPolygons())` and `road.dirtyPolygons.delete(obj)` before removing it from whatever map stores it.

Do not invent a separate pending-remove or dirty list — add the object to the existing `road.pendingRemoveHandles` / `road.dirtyPolygons` queues so the frame loop handles everything in one place.

### 17.6 Debugging memory health

Call from the browser console at any time:

```js
tool.renderer.debugMemory()
```

Key numbers to watch:

| Number | Healthy | Warning |
|---|---|---|
| `active` (vertices) | Goes to 0 after clearing all nodes | Stays > 0 after clearing → leak |
| `fragmentationPct` | < 20% during normal use | > 50% → many size-varying polygons not being recycled |
| `freeSlotCount` | Grows/shrinks as polygons are added/removed | Grows monotonically → slots are freed but never reused |
| `cursor` vs `active` | Cursor grows, active tracks reality | Cursor >> active means lots of wasted address space |

The `cursor` never goes down. If you see it grow without bound while `active` stays small, the free-list is accumulating slots that never match incoming `addPolygon` size requests. This usually means polygon sizes are changing too wildly — consider normalizing sizes (e.g. always rounding vertex count to a fixed grid) if this becomes a problem at scale.
