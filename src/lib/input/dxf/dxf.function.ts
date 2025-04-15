import { V2 } from 'vecks';
import type { Arc as DxfArc, Circle as DxfCircle, Ellipse as DxfEllipse, Line as DxfLine, LWPolyline as DxfLWPolyline, Point2D as DxfPoint, Spline as DxfSpline } from 'dxf/handlers/entities';
import type { EllipseData } from '$lib/geometry/ellipse/ellipse.data';
import type { PointData } from '$lib/geometry/point/point.data';
import type { PolyshapeData } from '$lib/geometry/polyshape/polyshape.data';
import type { Shape } from '$lib/geometry/shape/shape';
import type { ArcData } from '$lib/geometry/arc/arc.data';
import { Arc } from '$lib/geometry/arc/arc';
import { Line } from '$lib/geometry/line/line';
import type { CircleData } from '$lib/geometry/circle/circle.data';
import type { LineData } from '$lib/geometry/line/line.data';
import type { SplineData } from '$lib/geometry/spline/spline.data';
import type { TransformData } from "$lib/geometry/transform/transform.data";
import { ArcDirectionEnum } from '$lib/geometry/arc/arc.enum';
import { degreesToRadians } from "$lib/geometry/angle/angle.function";
import type InsertEntityData from 'dxf/handlers/entity/insert';

export function dxfArcToArcData(dxfArc: DxfArc): ArcData {
    return {
        origin: { x: dxfArc.x, y: dxfArc.y },
        radius: dxfArc.r,
        startAngle: dxfArc.startAngle,
        endAngle: dxfArc.endAngle
    }
}

export function dxfCircleToCircleData(dxfCircle: DxfCircle): CircleData {
    return {
        origin: { x: dxfCircle.x, y: dxfCircle.y },
        radius: dxfCircle.r
    }
}

export function dxfEllipseToEllipseData(dxfEllipse: DxfEllipse): EllipseData {

    // DXF ellipse center point
    const origin: PointData = {
        x: dxfEllipse.x,
        y: dxfEllipse.y
    };

    // Calculate major axis length and rotation
    const majorX = dxfEllipse.majorX;
    const majorY = dxfEllipse.majorY;
    const majorLength = Math.sqrt(majorX * majorX + majorY * majorY);

    // Calculate rotation angle from major axis vector
    // atan2 gives angle in radians from positive x-axis
    const rotation = Math.atan2(majorY, majorX);

    // Calculate minor axis length using ratio
    const ratio = dxfEllipse.axisRatio ?? 1;
    const minorLength = majorLength * ratio;

    const data = {
        origin,
        majorLength,
        minorLength,
        rotation,
        startAngle: dxfEllipse.startAngle,
        endAngle: dxfEllipse.endAngle
    };

    return data;
}

export function dxfLineToLineData(dxfLine: DxfLine): LineData {
    return {
        startPoint: { x: dxfLine.start?.x, y: dxfLine.start?.y },
        endPoint: { x: dxfLine.end?.x, y: dxfLine.end?.y }
    }
}

export function dxfPointToPointData(dxfPoint: DxfPoint): PointData {
    return { x: dxfPoint.x, y: dxfPoint.y };
}

export function dxfPointsToPolyshapeData(lwpolyline: DxfLWPolyline): PolyshapeData {

    const vertices = lwpolyline.vertices;
    let shapes: Shape[] = vertices.slice(1).map((curr, i) =>
        dxfPointsToShape(vertices[i], curr)
    );

    // If polyline is closed, add a final line back to start
    if (lwpolyline.closed && vertices.length > 0) {
        shapes.push(dxfPointsToShape(vertices[vertices.length - 1], vertices[0]));
    }

    return { shapes };
}

/**
 * Convert 2 DXF points to a Shape.
 * Create an Arc if bulge is set, otherwise create a Line.
 */
export function dxfPointsToShape(startPoint: DxfPoint, endPoint: DxfPoint): Shape {
    if (Object.hasOwn(startPoint, 'bulge') && startPoint.bulge != 0) {
        const arcData: ArcData = dxfBulgeToArcData(startPoint, endPoint, startPoint.bulge);
        return new Arc(arcData);
    } else {
        return new Line({ startPoint, endPoint });
    }
}

export function dxfSplineToSplineData(dxfSpline: DxfSpline): SplineData {
    return { 
        controlPoints: dxfSpline.controlPoints,
        degree: dxfSpline.degree,
        weights: dxfSpline.weights,
        knots: dxfSpline.knots
     }
}

export function dxfBulgeToArcData(startPoint: DxfPoint, endPoint: DxfPoint, bulge: number): ArcData {

    // If the bulge is < 0, the arc goes clockwise. So we simply
    // reverse a and b and invert sign
    // Bulge = tan(theta/4)
    let theta: number;
    let direction: ArcDirectionEnum;
    // let a
    // let b
    if (bulge < 0) {
    //     theta = Math.atan(-bulge) * 4;
        direction = ArcDirectionEnum.CW;
    //     // a = new V2(from[0], from[1])
    //     // b = new V2(to[0], to[1])
    } else {
    //     // Default is counter-clockwise
    //     theta = Math.atan(bulge) * 4;
        direction = ArcDirectionEnum.CCW;
    //     // a = new V2(to[0], to[1])
    //     // b = new V2(from[0], from[1])
    //     [startPoint, endPoint] = [endPoint, startPoint];
    }
    theta = 4 * Math.atan(bulge);
    // direction = ArcDirectionEnum.CW; // From Polylinie.dxf $ARCDIR

    const dx = endPoint.x - startPoint.x;
    const dy = endPoint.y - startPoint.y;
    const chord = Math.sqrt(dx * dx + dy * dy);

    const radius = Math.abs(chord / (2 * Math.sin(theta / 2)));

    const chordMidX = (startPoint.x + endPoint.x) / 2;
    const chordMidY = (startPoint.y + endPoint.y) / 2;
    const perpDist = radius * Math.cos(theta / 2);
    const perpAngle = Math.atan2(dy, dx) + (bulge > 0 ? Math.PI / 2 : -Math.PI / 2);

    const centerX = chordMidX + perpDist * Math.cos(perpAngle);
    const centerY = chordMidY + perpDist * Math.sin(perpAngle);

    const startAngle = Math.atan2(startPoint.y - centerY, startPoint.x - centerX);
    const endAngle = Math.atan2(endPoint.y - centerY, endPoint.x - centerX);

    return {
        origin: { x: centerX, y: centerY },
        radius,
        startAngle,
        endAngle,
        direction
        // direction: dxfBulgeArcDirection(bulge)
    };
}

export function dxfBulgeToArcData2(from: DxfPoint, to: DxfPoint, bulge: number): ArcData {
    // // Resolution in degrees
    // if (!resolution) {
    //   resolution = 5
    // }

    // If the bulge is < 0, the arc goes clockwise. So we simply
    // reverse a and b and invert sign
    // Bulge = tan(theta/4)
    let theta: number;
    let a: V2;
    let b: V2;
    let direction: ArcDirectionEnum;
    if (bulge < 0) {
        direction = ArcDirectionEnum.CW;
        theta = Math.atan(-bulge) * 4;
        a = new V2(from.x, from.y);
        b = new V2(to.x, to.y);
    } else {
        // Default is counter-clockwise
        // TODO Default is actually in DXF HEADER as $ANGDIR.
        direction = ArcDirectionEnum.CCW;
        theta = Math.atan(bulge) * 4;
        a = new V2(to.x, to.y);
        b = new V2(from.x, from.y);
    }

    const ab = b.sub(a);
    const lengthAB = ab.length();
    const c = a.add(ab.multiply(0.5));

    // Distance from center of arc to line between form and to points
    const lengthCD = Math.abs(lengthAB / 2 / Math.tan(theta / 2))
    const normAB = ab.norm()

    let d;
    if (theta < Math.PI) {
        const normDC = new V2(
            normAB.x * Math.cos(Math.PI / 2) - normAB.y * Math.sin(Math.PI / 2),
            normAB.y * Math.cos(Math.PI / 2) + normAB.x * Math.sin(Math.PI / 2),
        )
        // D is the center of the arc
        d = c.add(normDC.multiply(-lengthCD))
    } else {
        const normCD = new V2(
            normAB.x * Math.cos(Math.PI / 2) - normAB.y * Math.sin(Math.PI / 2),
            normAB.y * Math.cos(Math.PI / 2) + normAB.x * Math.sin(Math.PI / 2),
        )
        // D is the center of the arc
        d = c.add(normCD.multiply(lengthCD))
    }

    // Add points between start start and eng angle relative
    // to the center point
    let startAngle = Math.atan2(b.y - d.y, b.x - d.x);
    let endAngle = Math.atan2(a.y - d.y, a.x - d.x);
    if (endAngle < startAngle) {
        endAngle += degreesToRadians(360);
    }
    const r = b.sub(d).length();

    // const startInter =
    //   Math.floor(startAngle / resolution) * resolution + resolution
    // const endInter = Math.ceil(endAngle / resolution) * resolution - resolution
    // const points = []
    // for (let i = startInter; i <= endInter; i += resolution) {
    //   points.push(
    //     d.add(
    //       new V2(
    //         Math.cos((i / 180) * Math.PI) * r,
    //         Math.sin((i / 180) * Math.PI) * r,
    //       ),
    //     ),
    //   )
    // }

    // Maintain the right ordering to join the from and to points
    // if (bulge < 0) {
    //     // points.reverse()
    //     [startAngle, endAngle] = [endAngle, startAngle];
    // }
    
    // return points.map((p) => [p.x, p.y])

    return {
        origin: {x: d.x, y: d.y},
        radius: r,
        startAngle,
        endAngle,
        direction
    };
}


export function dxfEntityTransformToTransformData(dxfTransform: InsertEntityData): TransformData {
    return {
        // In DXF, the INSERT entity defines x,y as the insertion point of a BLOCK.
        // We treat insert point as a transform from 0,0.
        translateX: dxfTransform.x ?? 0,
        translateY: dxfTransform.y ?? 0,
        // Rotation angle in degrees around Z axis
        rotateAngle: dxfTransform.rotation ? degreesToRadians(dxfTransform.rotation) : 0,
        // Scale transform. Default to 1 for no change in size.
        scaleX: dxfTransform.scaleX ?? 1,
        scaleY: dxfTransform.scaleY ?? 1
    };
}

/**
 * Returns a conversion factor to scale DXF measurement to screen pixels.
 */
export function dxfMeasurementToPx(unit: number | undefined) {
    const units = unit || 0;
    const unitsToMm = {
        0: 1,    // Unitless - assume mm
        1: 25.4, // Inches
        2: 304.8,// Feet
        3: 1609344, // Miles
        4: 1,    // Millimeters
        5: 10,   // Centimeters
        6: 1000  // Meters
    };
    const scale = unitsToMm[units] || 1;
    // Set physical size attributes (96 DPI is standard for browsers)
    const dpi = 96;
    const mmPerInch = 25.4;
    const pxPerMm = dpi / mmPerInch;
    // Factor to scale DXF measurement to screen pixels
    const dxfMeasurementToPxFactor = scale * pxPerMm;
    return dxfMeasurementToPxFactor;
}

// /**
//  * Apply the transforms to the polyline.
//  *
//  * @param polyline the polyline
//  * @param transform the transforms array
//  * @returns the transformed polyline
//  */
// export function applyTransforms (geometry: Geometry, transforms: TransformMatrix[]) {
//     transforms.forEach((transform) => {
//       polyline = polyline.map(function (p) {

//         geometry.transform(transform);

//         // Use a copy to avoid side effects
//         // let p2 = [p[0], p[1]]

//         // Scaling transform
//         // if (transform.scaleX) {
//         //   p2[0] = p2[0] * transform.scaleX
//         // }
//         // if (transform.scaleY) {
//         //   p2[1] = p2[1] * transform.scaleY
//         // }
//         // geometry.scale({x: transform.scaleX, y: transform.scaleY});

//         // Rotation transform
//         if (transform.rotation) {
//           const angle = (transform.rotation / 180) * Math.PI
//           p2 = [
//             p2[0] * Math.cos(angle) - p2[1] * Math.sin(angle),
//             p2[1] * Math.cos(angle) + p2[0] * Math.sin(angle),
//           ]
//         }

//         // Translate transform
//         if (transform.x) {
//           p2[0] = p2[0] + transform.x
//         }
//         if (transform.y) {
//           p2[1] = p2[1] + transform.y
//         }

//         // Observed once in a sample DXF - some cad applications
//         // use negative extruxion Z for flipping
//         if (transform.extrusionZ === -1) {
//           p2[0] = -p2[0]
//         }

//         return p2
//       })
//     })
//     return polyline
//   }