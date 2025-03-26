import { scale, rotate, translate, compose, applyToPoint } from 'transformation-matrix';
import type { CircleData } from './circle.data';
import type { TransformData } from '../transform/transform.data';
import type { PointData } from '../point/point.data';

export function circleTransform(transform: TransformData, circle: CircleData): CircleData {
    // Create transformation matrix
    const matrix = compose(
        translate(transform.translateX || 0, transform.translateY || 0),
        // Does not rotate around center of circle!
        // rotate(transform.rotateAngle || 0),
        scale(transform.scaleX || 1, transform.scaleY || 1)
    );

    // Transform origin point
    const newOrigin = applyToPoint(matrix, circle.origin);
    const origin: PointData = {x: newOrigin.x, y: newOrigin.y};

    // Scale radius (use average of X and Y scale since circle should stay circular)
    const scaleX = transform.scaleX || 1;
    const radius = circle.radius * scaleX;

    return {
        origin,
        radius
    };
}