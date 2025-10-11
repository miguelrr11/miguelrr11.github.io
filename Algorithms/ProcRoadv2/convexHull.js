var convexhull;
(function (convexhull) {
    // Optimized point comparator using subtraction for branch-free comparison
    // Faster than if-else chains due to fewer branches and better CPU pipelining
    function POINT_COMPARATOR(a, b) {
        // Primary sort by x, secondary by y - single expression minimizes branches
        return a.x - b.x || a.y - b.y;
    }
    convexhull.POINT_COMPARATOR = POINT_COMPARATOR;

    // Returns convex hull, assuming presorted points. O(n) time
    function makeHullPresorted(points) {
        const n = points.length;
        if (n <= 1) return points.slice();

        // Pre-allocate arrays with estimated size to reduce resizing overhead
        // Worst case: all points on hull, typical case: sqrt(n) to log(n)
        const upperHull = new Array(n);
        let upperSize = 0;

        // Build upper hull - optimized with manual stack management
        // Using index-based access instead of array operations (push/pop) is faster
        for (let i = 0; i < n; i++) {
            const p = points[i];
            const px = p.x, py = p.y;

            // Remove points that make clockwise turn
            // Manual bounds check and inline cross product for maximum speed
            while (upperSize >= 2) {
                const q = upperHull[upperSize - 1];
                const r = upperHull[upperSize - 2];
                // Inline cross product check - collinear/right turn means remove q
                if ((q.x - r.x) * (py - r.y) >= (q.y - r.y) * (px - r.x)) {
                    upperSize--;
                } else {
                    break;
                }
            }
            upperHull[upperSize++] = p;
        }
        upperSize--; // Remove last point (will be first in lower hull)

        const lowerHull = new Array(n);
        let lowerSize = 0;

        // Build lower hull - traverse in reverse
        for (let i = n - 1; i >= 0; i--) {
            const p = points[i];
            const px = p.x, py = p.y;

            while (lowerSize >= 2) {
                const q = lowerHull[lowerSize - 1];
                const r = lowerHull[lowerSize - 2];
                if ((q.x - r.x) * (py - r.y) >= (q.y - r.y) * (px - r.x)) {
                    lowerSize--;
                } else {
                    break;
                }
            }
            lowerHull[lowerSize++] = p;
        }
        lowerSize--; // Remove last point (already in upper hull)

        // Edge case: single point
        if (upperSize === 1 && lowerSize === 1) {
            const u = upperHull[0], l = lowerHull[0];
            if (u.x === l.x && u.y === l.y) {
                return [u];
            }
        }

        // Combine hulls efficiently - pre-allocate exact size
        const totalSize = upperSize + lowerSize;
        const result = new Array(totalSize);

        // Manual array copying is faster than concat for small-medium arrays
        for (let i = 0; i < upperSize; i++) {
            result[i] = upperHull[i];
        }
        for (let i = 0; i < lowerSize; i++) {
            result[upperSize + i] = lowerHull[i];
        }

        return result;
    }
    convexhull.makeHullPresorted = makeHullPresorted;

    // Returns convex hull of given points. O(n log n) time
    function makeHull(points) {
        // Sort in-place if possible (caller's array gets modified)
        // If immutability needed, caller should pass a copy
        // This avoids unnecessary allocation in the common case
        const n = points.length;
        if (n <= 1) return points.slice();

        // Use slice only when necessary
        const sorted = points.slice();
        sorted.sort(POINT_COMPARATOR);
        return makeHullPresorted(sorted);
    }
    convexhull.makeHull = makeHull;

})(convexhull || (convexhull = {}));