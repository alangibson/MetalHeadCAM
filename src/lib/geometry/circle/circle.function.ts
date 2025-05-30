import { scale, rotate, translate, compose, applyToPoint } from 'transformation-matrix';
import type { CircleData } from './circle.data';
import type { TransformData } from '../transform/transform.data';
import type { PointData } from '../point/point.data';
import type { BoundaryData } from '../boundary/boundary.data';
import { angleBetweenPoints } from '../angle/angle.function';
import type { AngleRadians } from '../angle/angle.type';

export function circleTransform(transform: TransformData, circle: CircleData): CircleData {
    // Create transformation matrix
    const matrix = compose(
        translate(transform.translateX || 0, transform.translateY || 0),
        rotate(transform.rotateAngle || 0),
        scale(transform.scaleX || 1, transform.scaleY || 1)
    );

    const newOrigin = applyToPoint(matrix, circle.origin);
    const origin: PointData = {
        x: newOrigin.x,
        y: newOrigin.y
    };

    // Scale radius (use average of X and Y scale since circle should stay circular)
    const scaleX = transform.scaleX || 1;
    const radius = circle.radius * scaleX;

    return {
        origin,
        radius
    };
}

export function circleStartPoint(circle: CircleData): PointData {
    return {
        x: circle.origin.x + circle.radius,
        y: circle.origin.y
    };
}

export function circleEndPoint(circle: CircleData): PointData {
    return {
        x: circle.origin.x + circle.radius,
        y: circle.origin.y
    };
}

/** Sample Circle to an array of Points */
export function circleTessellate(circle: CircleData, samples: number = 1000): PointData[] {
	const points: PointData[] = [];
	for (let i = 0; i <= samples; i++) {
		const theta = (i / samples) * 2 * Math.PI;
		const point = {
			x: circle.origin.x + circle.radius * Math.cos(theta),
			y: circle.origin.y + circle.radius * Math.sin(theta)
		};
		points.push(point);
	}
	return points;
}

/** Calculate a bounding box for a circle */
export function circleBoundary(circle: CircleData): BoundaryData {
    return {
        startPoint: {
            x: circle.origin.x - circle.radius,
            y: circle.origin.y - circle.radius
        },
        endPoint: {
            x: circle.origin.x + circle.radius,
            y: circle.origin.y + circle.radius
        }
    };
}

/**
 * Returns the middle point along a circle.
 * For a circle, this is a point on the left side (180 degrees).
 * This represents the middle point when traversing the circle counter-clockwise.
 */
export function circleMiddlePoint(circle: CircleData): PointData {
    return {
        x: circle.origin.x - circle.radius,
        y: circle.origin.y
    };
}

/**
 * Calculates the tangent angle at a given point on the circle.
 * The tangent is perpendicular to the radius at that point.
 */
export function circleTangentAt(circle: CircleData, point: PointData): AngleRadians {
    // Calculate the angle from the center to the point
    const angle = angleBetweenPoints(circle.origin, point);
    // The tangent is perpendicular to the radius
    return angle + Math.PI / 2;
}