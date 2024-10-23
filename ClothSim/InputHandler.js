class InputHandler {
    static CLICK_TOLERANCE = 20

    static handleMouseClick(particles, constraints) {
        this.tearCloth(mouseX, mouseY, constraints);
    }

    static pointToSegmentDistance(px, py, x1, y1, x2, y2) {
        let ABx = x2 - x1;
        let ABy = y2 - y1;

        let APx = px - x1;
        let APy = py - y1;

        let BPx = px - x2;
        let BPy = py - y2;

        let AB_AP = ABx * APx + ABy * APy;
        let AB_AB = ABx * ABx + ABy * ABy;
        let t = AB_AP / AB_AB;

        if (t < 0.0) return Math.sqrt(APx * APx + APy * APy);
        else if (t > 1.0) return Math.sqrt(BPx * BPx + BPy * BPy);
        else {
            let projX = x1 + t * ABx;
            let projY = y1 + t * ABy;
            return Math.sqrt((px - projX) * (px - projX) + (py - projY) * (py - projY));
        }
    }

    static findNearestConstraint(mouseX, mouseY, constraints) {
        let nearestConstraint = null;
        let minDistance = this.CLICK_TOLERANCE;

        for (let constraint of constraints) {
            let distance = this.pointToSegmentDistance(mouseX, mouseY,
                constraint.p1.pos.x, constraint.p1.pos.y,
                constraint.p2.pos.x, constraint.p2.pos.y);

            if (distance < minDistance) {
                minDistance = distance;
                nearestConstraint = constraint;
            }
        }
        return nearestConstraint;
    }

    static tearCloth(mouseX, mouseY, constraints) {
        let nearest = this.findNearestConstraint(mouseX, mouseY, constraints);
        if (nearest) {
            nearest.deactivate();
        }
    }


}
