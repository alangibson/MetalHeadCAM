import type { PointData } from '../point/point.data';
import { rotateAngleNormalized } from '../shape/shape.function';
import type { TransformData } from '../transform/transform.data';
import type { EllipseData } from './ellipse.data';
import { scale, rotate, translate, compose, applyToPoint } from 'transformation-matrix';

export function getPointAtAngleOnEllipse(
    origin: PointData,
    majorLength: number,
    minorLength: number,
    rotation: number,
    angle: number
): PointData {
    // Get point on unrotated ellipse
    const x = majorLength * Math.cos(angle);
    const y = minorLength * Math.sin(angle);

    // Rotate point by ellipse rotation
    const rotatedX = x * Math.cos(rotation) - y * Math.sin(rotation);
    const rotatedY = x * Math.sin(rotation) + y * Math.cos(rotation);

    // Translate to ellipse origin
    return {
        x: origin.x + rotatedX,
        y: origin.y + rotatedY
    };
}

export function ellipseTransform(transform: TransformData, ellipse: EllipseData): EllipseData {
    // Create transformation matrix
    const matrix = compose(
        translate(transform.translateX || 0, transform.translateY || 0),
        rotate(transform.rotateAngle || 0),
        scale(transform.scaleX || 1, transform.scaleY || 1)
    );
    
    // Transform origin point
    const newOrigin = applyToPoint(matrix, ellipse.origin);
    const origin = { x: newOrigin.x, y: newOrigin.y };

    // Scale major and minor lengths
    const majorLength = ellipse.majorLength * (transform.scaleX || 1);
    const minorLength = ellipse.minorLength * (transform.scaleY || 1);

    // Add rotation
    const rotation = rotateAngleNormalized(transform.rotateAngle || 0, ellipse.rotation)

    // TODO update startAngle and endAngle?
    return {
        origin,
        rotation,
        majorLength,
        minorLength,
        startAngle: ellipse.startAngle,
        endAngle: ellipse.endAngle
    };
}
