class DynamicAABBTree {

    constructor(fatMargin = 5) {
        this.root = null;
        this.fatMargin = fatMargin;
        this.pairFrame = 0;

        this.nLeafs = 0 //just for debugging
    }

    // =========================
    // AABB Utilities
    // =========================

    static combine(a, b) {
        return {
            minX: Math.min(a.minX, b.minX),
            minY: Math.min(a.minY, b.minY),
            maxX: Math.max(a.maxX, b.maxX),
            maxY: Math.max(a.maxY, b.maxY)
        };
    }

    static overlaps(a, b) {
        return !(a.maxX < b.minX ||
                 a.minX > b.maxX ||
                 a.maxY < b.minY ||
                 a.minY > b.maxY);
    }

    static perimeter(a) {
        return 2 * ((a.maxX - a.minX) + (a.maxY - a.minY));
    }

    // =========================
    // Public API
    // =========================

    insert(body) {
        computeAABB(body);

        const fat = {
            minX: body.minX - this.fatMargin,
            minY: body.minY - this.fatMargin,
            maxX: body.maxX + this.fatMargin,
            maxY: body.maxY + this.fatMargin
        };

        const leaf = {
            aabb: fat,
            parent: null,
            left: null,
            right: null,
            body: body
        };

        body._treeNode = leaf;

        this._insertLeaf(leaf);
    }

    //style this outside
    visualize(leaf = this.root){
        if(leaf){
            rect(leaf.aabb.minX, leaf.aabb.minY, leaf.aabb.maxX - leaf.aabb.minX, leaf.aabb.maxY - leaf.aabb.minY)
            if(!leaf.body){
                this.visualize(leaf.left)
                this.visualize(leaf.right)
            }
        }
    }

    remove(body) {
        const leaf = body._treeNode;
        if (!leaf) return;

        this._removeLeaf(leaf);
        body._treeNode = null;
    }

    update(body) {
        const leaf = body._treeNode;

        computeAABB(body);

        const aabb = leaf.aabb;

        // If still inside fat AABB, do nothing
        if (
            body.minX >= aabb.minX &&
            body.minY >= aabb.minY &&
            body.maxX <= aabb.maxX &&
            body.maxY <= aabb.maxY
        ) return;

        this.remove(body);
        this.insert(body);
    }

    computePairs(callback) {
        this.pairFrame++;

        const stack = [];

        this.nLeafs = 0
        this._queryAll(this.root, callback, stack);
    }

    _queryAll(node, callback, stack) {
        if (!node) return;
        this.nLeafs++

        if (node.body) {
            // Query tree against this leaf
            this._query(node.body, node.aabb, callback, stack);
        } else {
            this._queryAll(node.left, callback, stack);
            this._queryAll(node.right, callback, stack);
        }
    }

    _query(body, aabb, callback, stack) {
        stack.length = 0;
        stack.push(this.root);

        while (stack.length > 0) {
            const node = stack.pop();
            if (!node) continue;

            if (!DynamicAABBTree.overlaps(node.aabb, aabb)) continue;

            if (node.body) {
                const other = node.body;
                if (other === body) continue;

                // id check alone is sufficient to prevent duplicate pairs
                if (body.id < other.id) {
                    callback(body, other);
                }
            } else {
                stack.push(node.left);
                stack.push(node.right);
            }
        }
    }




    // =========================
    // Internal Tree Operations
    // =========================

    _insertLeaf(leaf) {

        if (this.root === null) {
            this.root = leaf;
            return;
        }

        let current = this.root;

        // Descend tree choosing best cost
        while (!current.body) {
            const left = current.left;
            const right = current.right;

            const currentCost = DynamicAABBTree.perimeter(
                DynamicAABBTree.combine(current.aabb, leaf.aabb)
            );

            // Cost to insert as sibling of left vs right child
            const costLeft = DynamicAABBTree.perimeter(
                DynamicAABBTree.combine(left.aabb, leaf.aabb)
            );
            const costRight = DynamicAABBTree.perimeter(
                DynamicAABBTree.combine(right.aabb, leaf.aabb)
            );

            // Stop descending if inserting here is cheaper than going deeper
            if (currentCost <= costLeft && currentCost <= costRight) break;

            current = costLeft < costRight ? left : right;
        }

        const oldLeaf = current;
        const parent = oldLeaf.parent;

        const newParent = {
            parent: parent,
            left: oldLeaf,
            right: leaf,
            body: null,
            aabb: DynamicAABBTree.combine(oldLeaf.aabb, leaf.aabb)
        };

        oldLeaf.parent = newParent;
        leaf.parent = newParent;

        if (parent === null) {
            this.root = newParent;
        } else {
            if (parent.left === oldLeaf) parent.left = newParent;
            else parent.right = newParent;

            this._fixUpwards(parent);
        }
    }

    _removeLeaf(leaf) {

        if (leaf === this.root) {
            this.root = null;
            return;
        }

        const parent = leaf.parent;
        const grandParent = parent.parent;
        const sibling = parent.left === leaf ? parent.right : parent.left;

        if (grandParent === null) {
            this.root = sibling;
            sibling.parent = null;
        } else {
            if (grandParent.left === parent) grandParent.left = sibling;
            else grandParent.right = sibling;

            sibling.parent = grandParent;
            this._fixUpwards(grandParent);
        }
    }

    _fixUpwards(node) {
        while (node) {
            node.aabb = DynamicAABBTree.combine(node.left.aabb, node.right.aabb);
            node = node.parent;
        }
    }

    _traversePairs(node, callback) {
        if (!node || node.body) return;

        this._checkPair(node.left, node.right, callback);

        this._traversePairs(node.left, callback);
        this._traversePairs(node.right, callback);
    }

    _checkPair(a, b, callback) {

        if (!DynamicAABBTree.overlaps(a.aabb, b.aabb)) return;

        if (a.body && b.body) {

            const bodyA = a.body;
            const bodyB = b.body;

            if (bodyA.id < bodyB.id) {
                if (bodyB._pairStamp === this.pairFrame) return;
                bodyB._pairStamp = this.pairFrame;
            } else {
                if (bodyA._pairStamp === this.pairFrame) return;
                bodyA._pairStamp = this.pairFrame;
            }

            callback(bodyA, bodyB);
            return;
        }

        if (a.body) {
            this._checkPair(a, b.left, callback);
            this._checkPair(a, b.right, callback);
        } else if (b.body) {
            this._checkPair(a.left, b, callback);
            this._checkPair(a.right, b, callback);
        } else {
            this._checkPair(a.left, b.left, callback);
            this._checkPair(a.left, b.right, callback);
            this._checkPair(a.right, b.left, callback);
            this._checkPair(a.right, b.right, callback);
        }
    }
}
