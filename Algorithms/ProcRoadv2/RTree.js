// RTREE implementation by Claude Sonnet 4.6 
// ─── MBR helpers ──────────────────────────────────────────────────────────────

function mbrArea({ minX, minY, maxX, maxY }) {
  return Math.max(0, maxX - minX) * Math.max(0, maxY - minY);
}

function mbrUnion(a, b) {
  return {
    minX: Math.min(a.minX, b.minX),
    minY: Math.min(a.minY, b.minY),
    maxX: Math.max(a.maxX, b.maxX),
    maxY: Math.max(a.maxY, b.maxY),
  };
}

function mbrEnlargement(mbr, candidate) {
  return mbrArea(mbrUnion(mbr, candidate)) - mbrArea(mbr);
}

function mbrOverlaps(a, b) {
  return (
    a.minX <= b.maxX &&
    a.maxX >= b.minX &&
    a.minY <= b.maxY &&
    a.maxY >= b.minY
  );
}

function mbrMinSqDist(mbr, px, py) {
  const dx = Math.max(mbr.minX - px, 0, px - mbr.maxX);
  const dy = Math.max(mbr.minY - py, 0, py - mbr.maxY);
  return dx * dx + dy * dy;
}

// ─── Internal tree structures ─────────────────────────────────────────────────

class TreeNode {
  constructor(isLeaf = true) {
    this.isLeaf   = isLeaf;
    this.mbr      = null;
    this.entries  = [];   // leaf items  — Entry[]
    this.children = [];   // branch kids — TreeNode[]
    this.parent   = null;
  }

  recalcMBR() {
    const items = this.isLeaf ? this.entries : this.children;
    if (items.length === 0) { this.mbr = null; return; }
    let mbr = { ...items[0].mbr };
    for (let i = 1; i < items.length; i++) mbr = mbrUnion(mbr, items[i].mbr);
    this.mbr = mbr;
  }

  get size() {
    return this.isLeaf ? this.entries.length : this.children.length;
  }
}

class Entry {
  constructor(mbr, data) {
    this.mbr  = mbr;   // { minX, minY, maxX, maxY }
    this.data = data;  // user payload
  }
}

// ─── MinHeap (used by nearest()) ──────────────────────────────────────────────

class MinHeap {
  constructor(cmp = (a, b) => a - b) {
    this._d   = [];
    this._cmp = cmp;
  }
  get size() { return this._d.length; }
  push(item) { this._d.push(item); this._up(this._d.length - 1); }
  pop() {
    if (!this._d.length) return undefined;
    const top  = this._d[0];
    const last = this._d.pop();
    if (this._d.length) { this._d[0] = last; this._down(0); }
    return top;
  }
  _up(i) {
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this._cmp(this._d[i], this._d[p]) < 0) {
        [this._d[i], this._d[p]] = [this._d[p], this._d[i]]; i = p;
      } else break;
    }
  }
  _down(i) {
    const n = this._d.length;
    for (;;) {
      let s = i, l = 2*i+1, r = 2*i+2;
      if (l < n && this._cmp(this._d[l], this._d[s]) < 0) s = l;
      if (r < n && this._cmp(this._d[r], this._d[s]) < 0) s = r;
      if (s === i) break;
      [this._d[i], this._d[s]] = [this._d[s], this._d[i]]; i = s;
    }
  }
}

// ─── RTree — generic, payload-agnostic ───────────────────────────────────────

/**
 * Generic R-tree spatial index.
 *
 * Callers are responsible for computing MBRs before calling insert/delete.
 * Use GraphIndex (below) for the graph-specific helpers.
 *
 * @example
 *   const tree = new RTree({ maxEntries: 9 });
 *   tree.insert({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, myObject);
 *   tree.search({ minX: -5, minY: -5, maxX: 5, maxY: 5 }); // → [myObject]
 *   tree.delete({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, e => e.data === myObject);
 */
class RTree {
  constructor({ maxEntries = 9, minEntries } = {}) {
    this.M     = maxEntries;
    this.m     = minEntries ?? Math.ceil(maxEntries / 2);
    this._root = new TreeNode(true);
    this._size = 0;
  }

  get size() { return this._size; }

  // ── Core operations ────────────────────────────────────────────────────────

  /**
   * Insert an item.
   * @param {{ minX, minY, maxX, maxY }} mbr
   * @param {*} data  Arbitrary payload stored alongside the MBR.
   */
  insert(mbr, data) {
    const entry = new Entry(mbr, data);
    const leaf  = this._chooseLeaf(this._root, mbr);

    leaf.entries.push(entry);

    if (leaf.entries.length > this.M) {
        const [n1, n2] = this._splitNode(leaf);
        this._adjustTree(n1, n2);
    } else {
        this._adjustTree(leaf, null);
    }

    this._size++;
    }

  /**
   * Delete the first entry matching `predicate` inside `mbr`.
   * Returns true if something was removed.
   *
   * @param {{ minX, minY, maxX, maxY }} mbr
   * @param {(entry: Entry) => boolean} predicate
   */
  delete(mbr, predicate) {
    const leaf = this._findLeaf(this._root, mbr, predicate);
    if (!leaf) return false;

    const idx = leaf.entries.findIndex(predicate);
    if (idx === -1) return false;

    leaf.entries.splice(idx, 1);
    this._condenseTree(leaf);
    this._size--;

    if (!this._root.isLeaf && this._root.children.length === 1) {
      this._root = this._root.children[0];
      this._root.parent = null;
    }
    return true;
  }

  /**
   * Return all payloads whose MBR overlaps `rect`.
   * @param {{ minX, minY, maxX, maxY }} rect
   * @returns {Array<*>}
   */
  search(rect) {
    const results = [];
    this._search(this._root, rect, results);
    return results;
  }

  /** Return all payloads whose MBR contains the point (x, y). */
  searchPoint(x, y) {
    return this.search({ minX: x, minY: y, maxX: x, maxY: y });
  }

  /**
   * Return up to k nearest items to (x, y) ordered by distance.
   * @returns {Array<{ data: *, dist: number }>}
   */
  nearest(x, y, k = 1) {
    const heap = new MinHeap((a, b) => a[0] - b[0]);
    if (this._root.mbr) heap.push([mbrMinSqDist(this._root.mbr, x, y), this._root, false]);

    const results = [];
    while (heap.size > 0 && results.length < k) {
      const [, item, isEntry] = heap.pop();
      if (isEntry) {
        results.push({ data: item.data, dist: Math.sqrt(mbrMinSqDist(item.mbr, x, y)) });
      } else if (item.isLeaf) {
        for (const e of item.entries)  heap.push([mbrMinSqDist(e.mbr, x, y), e, true]);
      } else {
        for (const c of item.children) heap.push([mbrMinSqDist(c.mbr, x, y), c, false]);
      }
    }
    return results;
  }

  /** Remove all entries. */
  clear() {
    this._root = new TreeNode(true);
    this._size = 0;
  }

  /** Dump every payload (useful for debugging). */
  all() {
    return this.search({ minX: -Infinity, minY: -Infinity, maxX: Infinity, maxY: Infinity });
  }

  // ── Private ────────────────────────────────────────────────────────────────

  _search(node, rect, out) {
    if (!node.mbr || !mbrOverlaps(node.mbr, rect)) return;
    if (node.isLeaf) {
      for (const e of node.entries) if (mbrOverlaps(e.mbr, rect)) out.push(e.data);
    } else {
      for (const c of node.children) this._search(c, rect, out);
    }
  }

  _chooseLeaf(node, mbr) {
    if (node.isLeaf) return node;
    let best = null, bestE = Infinity, bestA = Infinity;
    for (const c of node.children) {
      const e = mbrEnlargement(c.mbr ?? mbr, mbr);
      const a = mbrArea(c.mbr ?? mbr);
      if (e < bestE || (e === bestE && a < bestA)) { best = c; bestE = e; bestA = a; }
    }
    return this._chooseLeaf(best, mbr);
  }

  _adjustTree(node, split) {
    node.recalcMBR();
    if (node === this._root) {
      if (split) {
        const newRoot = new TreeNode(false);
        newRoot.children.push(node, split);
        node.parent = split.parent = newRoot;
        this._root = newRoot;
        newRoot.recalcMBR();
      }
      return;
    }
    const parent = node.parent;
    if (split) {
      split.parent = parent;
      parent.children.push(split);
      if (parent.children.length > this.M) {
        const [p1, p2] = this._splitNode(parent);
        this._adjustTree(p1, p2);
        return;
      }
    }
    this._adjustTree(parent, null);
  }

  _splitNode(node) {
    const isLeaf = node.isLeaf;
    const items  = isLeaf ? node.entries : node.children;

    // Quadratic seed selection
    let s1 = 0, s2 = 1, maxWaste = -Infinity;
    for (let i = 0; i < items.length; i++)
      for (let j = i + 1; j < items.length; j++) {
        const waste = mbrArea(mbrUnion(items[i].mbr, items[j].mbr))
                    - mbrArea(items[i].mbr) - mbrArea(items[j].mbr);
        if (waste > maxWaste) { maxWaste = waste; s1 = i; s2 = j; }
      }

    const g1 = new TreeNode(isLeaf);
    const g2 = new TreeNode(isLeaf);
    g1.parent = g2.parent = node.parent;

    const add = (g, item) => {
      if (isLeaf) g.entries.push(item);
      else { g.children.push(item); item.parent = g; }
      g.mbr = g.mbr ? mbrUnion(g.mbr, item.mbr) : { ...item.mbr };
    };

    add(g1, items[s1]);
    add(g2, items[s2]);

    const remaining = items.filter((_, i) => i !== s1 && i !== s2);
    for (let k = 0; k < remaining.length; k++) {
      const item = remaining[k];
      const left = remaining.length - k;
      if (g1.size + left <= this.m) { add(g1, item); continue; }
      if (g2.size + left <= this.m) { add(g2, item); continue; }

      const d1 = mbrEnlargement(g1.mbr, item.mbr);
      const d2 = mbrEnlargement(g2.mbr, item.mbr);
      if      (d1 < d2)                               add(g1, item);
      else if (d2 < d1)                               add(g2, item);
      else if (mbrArea(g1.mbr) < mbrArea(g2.mbr))    add(g1, item);
      else if (g1.size <= g2.size)                    add(g1, item);
      else                                            add(g2, item);
    }

    if (isLeaf) node.entries  = g1.entries;
    else      { node.children = g1.children; node.children.forEach(c => c.parent = node); }
    node.recalcMBR();

    return [node, g2];
  }

  _findLeaf(node, mbr, predicate) {
    if (!node.mbr || !mbrOverlaps(node.mbr, mbr)) return null;
    if (node.isLeaf) return node.entries.some(predicate) ? node : null;
    for (const c of node.children) {
      const found = this._findLeaf(c, mbr, predicate);
      if (found) return found;
    }
    return null;
  }

  _condenseTree(node) {
    const orphans = [];
    let cur = node;
    while (cur !== this._root) {
      const parent = cur.parent;
      const items  = cur.isLeaf ? cur.entries : cur.children;
      if (items.length < this.m) {
        parent.children.splice(parent.children.indexOf(cur), 1);
        orphans.push(cur);
      } else {
        cur.recalcMBR();
      }
      cur = parent;
    }
    cur.recalcMBR();

    for (const orphan of orphans) {
      if (orphan.isLeaf) {
        for (const e of orphan.entries) {
          const leaf = this._chooseLeaf(this._root, e.mbr);
          leaf.entries.push(e);
          this._adjustTree(leaf, null);
        }
      } else {
        const targetDepth = this._treeHeight() - this._subtreeHeight(orphan);
        for (const child of orphan.children) this._reinsertBranch(child, targetDepth);
      }
    }
  }

_reinsertBranch(child, targetDepth, node = this._root, depth = 0) {
  if (depth === targetDepth) {
    child.parent = node;
    node.children.push(child);

    if (node.children.length > this.M) {
      const [n1, n2] = this._splitNode(node);
      this._adjustTree(n1, n2);
    } else {
      this._adjustTree(node, null);
    }
    return;
  }

  let best = null, bestE = Infinity;

  for (const c of node.children) {
    const e = mbrEnlargement(c.mbr ?? child.mbr, child.mbr);
    if (e < bestE) {
      best = c;
      bestE = e;
    }
  }

  if (best) {
    this._reinsertBranch(child, targetDepth, best, depth + 1);
  }
}

  _treeHeight() {
    let h = 0, n = this._root;
    while (n) { h++; n = n.isLeaf ? null : n.children[0]; }
    return h;
  }

  _subtreeHeight(node) {
    let h = 0, n = node;
    while (n) { h++; n = n.isLeaf ? null : n.children[0]; }
    return h;
  }
}

// ─── GraphIndex — two trees, separate ID pools ────────────────────────────────

/**
 * Spatial index for a graph with independently-pooled node and edge IDs.
 *
 * Two R-trees live inside:
 *   gi.nodes  — indexes graph nodes  (circle → square MBR)
 *   gi.edges  — indexes graph edges  (segment bounding box)
 *
 * Because the trees are separate, node id:1 and edge id:1 never collide.
 * Deletion only requires the id — no need to pass coordinates again.
 *
 * @example
 *   const gi = new GraphIndex();
 *
 *   gi.insertNode({ id: 1, x: 100, y: 200, radius: 20 });
 *   gi.insertEdge({ id: 1, x1: 100, y1: 200, x2: 300, y2: 400, width: 2 });
 *   //            ↑ same id, different pools — perfectly fine
 *
 *   gi.search({ minX: 80, minY: 180, maxX: 320, maxY: 420 });
 *   // → { nodes: [...], edges: [...] }
 *
 *   gi.deleteNode(1);
 *   gi.deleteEdge(1);
 */
class GraphIndex {
  constructor(rtreeOptions = {}) {
    this.nodes = new RTree(rtreeOptions);
    this.edges = new RTree(rtreeOptions);

    // id → MBR cache — lets delete() work with just the id
    this._nodeMBR = new Map();
    this._edgeMBR = new Map();
  }

  // ── Nodes ──────────────────────────────────────────────────────────────────

  /**
   * @param {{ id: *, x: number, y: number, radius?: number, [rest]: * }} node
   */
  insertNode({ id, x, y, radius = 0, ...rest }) {
    const mbr = { minX: x - radius, minY: y - radius,
                  maxX: x + radius, maxY: y + radius };
    this._nodeMBR.set(id, mbr);
    this.nodes.insert(mbr, { id, x, y, radius, ...rest });
  }

  /**
   * Move / resize a node in-place. Equivalent to deleteNode + insertNode
   * but expressed as a single intent.
   * @param {{ id: *, x: number, y: number, radius?: number, [rest]: * }} node
   */
  updateNode(node) {
    this.deleteNode(node.id);
    this.insertNode(node);
  }

  /**
   * @param {*} id
   * @returns {boolean} true if the node was found and removed
   */
  deleteNode(id) {
    const mbr = this._nodeMBR.get(id);
    if (!mbr) return false;
    const ok = this.nodes.delete(mbr, e => e.data.id === id);
    if (ok) this._nodeMBR.delete(id);
    return ok;
  }

  // ── Edges ──────────────────────────────────────────────────────────────────

  /**
   * @param {{ id: *, x1: number, y1: number, x2: number, y2: number, width?: number, [rest]: * }} edge
   */
  insertEdge({ id, x1, y1, x2, y2, width = 0, ...rest }) {
    const hw  = width / 2;
    const mbr = { minX: Math.min(x1, x2) - hw, minY: Math.min(y1, y2) - hw,
                  maxX: Math.max(x1, x2) + hw, maxY: Math.max(y1, y2) + hw };
    this._edgeMBR.set(id, mbr);
    this.edges.insert(mbr, { id, x1, y1, x2, y2, width, ...rest });
  }

  /**
   * Update an edge after one of its endpoint nodes moved.
   * @param {{ id: *, x1: number, y1: number, x2: number, y2: number, width?: number }} edge
   */
  updateEdge(edge) {
    this.deleteEdge(edge.id);
    this.insertEdge(edge);
  }

  /**
   * @param {*} id
   * @returns {boolean}
   */
  deleteEdge(id) {
    const mbr = this._edgeMBR.get(id);
    if (!mbr) return false;
    const ok = this.edges.delete(mbr, e => e.data.id === id);
    if (ok) this._edgeMBR.delete(id);
    return ok;
  }

  // ── Combined queries ───────────────────────────────────────────────────────

  /**
   * Search both trees and return matching nodes and edges separately.
   * @param {{ minX, minY, maxX, maxY }} rect
   * @returns {{ nodes: Array<*>, edges: Array<*> }}
   */
  search(rect) {
    return {
      nodes: this.nodes.search(rect),
      edges: this.edges.search(rect),
    };
  }

  /**
   * Items whose MBR contains the exact point (x, y).
   * @returns {{ nodes: Array<*>, edges: Array<*> }}
   */
  searchPoint(x, y) {
    return {
      nodes: this.nodes.searchPoint(x, y),
      edges: this.edges.searchPoint(x, y),
    };
  }

  /**
   * Items within radius r of (cx, cy).
   * Applies an exact circle–MBR rejection on top of the coarse rect pass,
   * using the cached MBRs so no re-computation is needed.
   * @returns {{ nodes: Array<*>, edges: Array<*> }}
   */
  searchRadius(cx, cy, r) {
    const rSq  = r * r;
    const rect = { minX: cx - r, minY: cy - r, maxX: cx + r, maxY: cy + r };

    const nodes = this.nodes.search(rect).filter(n => {
      const mbr = this._nodeMBR.get(n.id);
      return mbr && mbrMinSqDist(mbr, cx, cy) <= rSq;
    });

    const edges = this.edges.search(rect).filter(e => {
      const mbr = this._edgeMBR.get(e.id);
      return mbr && mbrMinSqDist(mbr, cx, cy) <= rSq;
    });

    return { nodes, edges };
  }

  /**
   * k nearest nodes to (x, y).
   * @returns {Array<{ data: *, dist: number }>}
   */
  nearestNodes(x, y, k = 1) {
    return this.nodes.nearest(x, y, k);
  }

  /**
   * k nearest edges to (x, y).
   * @returns {Array<{ data: *, dist: number }>}
   */
  nearestEdges(x, y, k = 1) {
    return this.edges.nearest(x, y, k);
  }

  /** Remove everything from both trees. */
  clear() {
    this.nodes.clear();
    this.edges.clear();
    this._nodeMBR.clear();
    this._edgeMBR.clear();
  }
}

/**
 * Draw all node MBRs at a given layer.
 *
 * @param {RTree} tree
 * @param {number} targetLayer  (0 = root)
 */
function drawRTreeLayer(tree, targetLayer) {
  if (!tree._root) return;

  function traverse(node, depth) {
    if (!node.mbr) return;

    if (depth === targetLayer) {
      drawMBR(node.mbr, node.isLeaf);
      return;
    }

    if (!node.isLeaf) {
      for (const child of node.children) {
        traverse(child, depth + 1);
      }
    }
  }

  traverse(tree._root, 0);
}

function drawMBR(mbr, isLeaf) {
  const w = mbr.maxX - mbr.minX;
  const h = mbr.maxY - mbr.minY;
  rect(mbr.minX, mbr.minY, w, h);
}