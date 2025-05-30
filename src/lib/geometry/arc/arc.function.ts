import { rotateAngleNormalized, degreesToRadians, normalizeAngle } from "../angle/angle.function";
import type { AngleRadians } from "../angle/angle.type";
import type { BoundaryData } from "../boundary/boundary.data";
import { OrientationEnum } from "../geometry/geometry.enum";
import type { PointData } from "../point/point.data";
import type { TransformData } from "../transform/transform.data";
import type { ArcData } from "./arc.data";
import { scale, rotate, translate, compose, applyToPoint } from 'transformation-matrix';

/**
 * Calculate the clockwise or counterclockwise sweep of an arc between two angles.
 * 
 * In DXF, and in math generally, sweep direction is CCW by default.
 * If the start angle is less than the end angle, the arc will naturally move
 * counterclockwise from the start to the end.
 * If the start angle is greater than the end angle, the arc still moves
 * counterclockwise but passes through the 0-degree point.
 * 
 * Note: this does not correctly handle zero-crossing angles
 */
export function arcOrientation(startAngle: number, endAngle: number): OrientationEnum {
    // FIXME Still wrong for some arcs.
    // See test file "Tractor Light Mount - Left.dxf"

    // Calculate angle difference before normalizing
    let angleDiff = endAngle - startAngle;

    // If angle difference is positive, arc direction is CCW
    // If angle difference is negative, arc direction is CW
    return angleDiff >= 0 ? OrientationEnum.COUNTERCLOCKWISE : OrientationEnum.CLOCKWISE;
}

export function arcSweepAngle(arc: ArcData): AngleRadians {
    return arc.endAngle - arc.startAngle;
}

export function arcStartPoint(arc: ArcData) {
    return {
        x: arc.origin.x + arc.radius * Math.cos(arc.startAngle),
        y: arc.origin.y + arc.radius * Math.sin(arc.startAngle)
    }
}

export function arcEndPoint(arc: ArcData) {
    return {
        x: arc.origin.x + arc.radius * Math.cos(arc.endAngle),
        y: arc.origin.y + arc.radius * Math.sin(arc.endAngle)
    }
}
``
export function arcTransform(transform: TransformData, arc: ArcData): ArcData {
    // Create transformation matrix
    const matrix = compose(
        translate(transform.translateX || 0, transform.translateY || 0),
        rotate(transform.rotateAngle || 0),
        scale(transform.scaleX || 1, transform.scaleY || 1)
    );

    // Transform origin point
    const newOrigin: PointData = applyToPoint(matrix, arc.origin);
    const origin: PointData = {
        x: newOrigin.x,
        y: newOrigin.y
    };

    // Scale radius
    const scaleX = transform.scaleX || 1;
    const radius = arc.radius * scaleX;

    // Add rotation to angles
    const rotation = transform.rotateAngle || 0;

    // Rotate and normalize angles to [0, 2π]
    const startAngle = rotateAngleNormalized(arc.startAngle, rotation);
    const endAngle = rotateAngleNormalized(arc.endAngle, rotation);

    return {
        origin,
        radius,
        startAngle,
        endAngle
    };
}

// Downsample an Arc into an array of points
export function arcTessellate(arc: ArcData, samples: number = 1000): PointData[] {
    const points: PointData[] = [];
    // Get the orientation if not explicitly provided
    const orientation = arc.orientation || arcOrientation(arc.startAngle, arc.endAngle);
    
    // Calculate the angular difference
    let deltaAngle: AngleRadians = arcSweepAngle(arc);
    
    // Adjust deltaAngle based on orientation
    if (orientation === OrientationEnum.COUNTERCLOCKWISE) {
        if (deltaAngle < 0) {
            deltaAngle += 2 * Math.PI;
        }
    } else {
        if (deltaAngle > 0) {
            deltaAngle -= 2 * Math.PI;
        }
    }

    for (let i = 0; i <= samples; i++) {
        const t = i / samples;
        // Arc approximation using circle parameterization, respecting orientation
        const theta = arc.startAngle + t * deltaAngle;
        let point: PointData = {
            x: arc.origin.x + arc.radius * Math.cos(theta),
            y: arc.origin.y + arc.radius * Math.sin(theta)
        };
        points.push(point);
    }
    return points;
}

// Calculate the coordinates of a point on the arc at a specific angle
export function pointAtAngle(cx: number, cy: number, radius: number, angle: number) {
    return {
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle)
    };
}

/** Calculate a bounding box for an arc */
export function arcBoundary(cx: number, cy: number, radius: number, startAngle: number, endAngle: number): BoundaryData {
    // Convert start and end angles to radians
    let start = degreesToRadians(startAngle);
    let end = degreesToRadians(endAngle);

    // Normalize angles so that start is always less than or equal to end
    if (end < start) {
        [start, end] = [end, start];
    }

    // Initial bounding box: starting and ending points of the arc
    let startPoint = pointAtAngle(cx, cy, radius, start);
    let endPoint = pointAtAngle(cx, cy, radius, end);

    let minX = Math.min(startPoint.x, endPoint.x);
    let maxX = Math.max(startPoint.x, endPoint.x);
    let minY = Math.min(startPoint.y, endPoint.y);
    let maxY = Math.max(startPoint.y, endPoint.y);

    // Check for extreme points where the arc crosses the x and y axes
    // The critical angles where the extreme points occur are 0, 90, 180, and 270 degrees (in radians)
    const criticalAngles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];

    criticalAngles.forEach((angle) => {
        // Check if the critical angle lies within the arc's angular range
        if (angle >= start && angle <= end) {
            let extremePoint = pointAtAngle(cx, cy, radius, angle);

            minX = Math.min(minX, extremePoint.x);
            maxX = Math.max(maxX, extremePoint.x);
            minY = Math.min(minY, extremePoint.y);
            maxY = Math.max(maxY, extremePoint.y);
        }
    });

    // Return the bounding box as an object with the min/max coordinates
    return {
        startPoint: { x: minX, y: minY },
        endPoint: { x: maxX, y: maxY }
    };
}

// An arc is closed if it forms a complete circle
export function arcIsClosed(arc: ArcData) {
    return Math.abs(arc.endAngle - arc.startAngle) >= 2 * Math.PI;
}

/** Calculate the bearing (tangent angle) at a point on the arc */
export function arcTangentAt(arc: ArcData, point: PointData): AngleRadians {
    // Calculate the angle from the center to the point
    const dx = point.x - arc.origin.x;
    const dy = point.y - arc.origin.y;
    const angle = Math.atan2(dy, dx);
    
    // The tangent is perpendicular to the radius
    // For CCW arcs, add 90 degrees (π/2)
    // For CW arcs, subtract 90 degrees (-π/2)
    const orientation = arc.orientation || arcOrientation(arc.startAngle, arc.endAngle);
    return angle + (orientation === OrientationEnum.COUNTERCLOCKWISE ? Math.PI / 2 : -Math.PI / 2);
}

/** Calculate midpoint of an arc */
export function arcMiddlePoint(arc: ArcData): PointData {
    // Get the orientation if not explicitly provided
    const orientation = arc.orientation || arcOrientation(arc.startAngle, arc.endAngle);
    
    // Calculate the angular difference
    let deltaAngle: AngleRadians = arcSweepAngle(arc);
    
    // Normalize angles to handle cases where they cross 0/2π boundary
    const startAngle = normalizeAngle(arc.startAngle);
    const endAngle = normalizeAngle(arc.endAngle);
    
    // Adjust deltaAngle based on orientation
    if (orientation === OrientationEnum.COUNTERCLOCKWISE) {
        if (deltaAngle < 0) {
            deltaAngle += 2 * Math.PI;
        }
    } else {
        if (deltaAngle > 0) {
            deltaAngle -= 2 * Math.PI;
        }
    }
    
    // Calculate the midpoint angle
    const midAngle = startAngle + deltaAngle / 2;
    
    // Calculate the midpoint coordinates
    return {
        x: arc.origin.x + arc.radius * Math.cos(midAngle),
        y: arc.origin.y + arc.radius * Math.sin(midAngle)
    };
}

