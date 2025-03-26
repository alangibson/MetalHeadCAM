import { V2 } from 'vecks'
import type { Arc as DxfArc, Circle as DxfCircle, Ellipse as DxfEllipse, Line as DxfLine, LWPolyline as DxfLWPolyline, Point2D as DxfPoint, Spline as DxfSpline} from 'dxf/handlers/entities';
import type { EllipseData } from '$lib/geometry/ellipse/ellipse.data';
import type { PointData } from '$lib/geometry/point/point.data';
import type { PolyshapeData } from '$lib/geometry/polyshape/polyshape.data';
import type { Shape } from '$lib/geometry/shape/shape';
import type { ArcData } from '$lib/geometry/arc/arc.data';
import { Arc } from '$lib/geometry/arc/arc';
import { Line } from '$lib/geometry/line/line';
import type { CircleData } from '$lib/geometry/circle/circle.data';
import type { LineData } from '$lib/geometry/line/line.data';
import type { CubicCurveData } from '$lib/geometry/cubic-curve/cubic-curve.data';
import type { QuadraticCurveData } from '$lib/geometry/quadratic-curve/quadratic-curve.data';
import type { SplineData } from '$lib/geometry/spline/spline.data';
import type { Entity as DxfEntity } from 'dxf/handlers/entities';
import type { TransformData } from "$lib/geometry/transform/transform.data";

export function dxfArcToArcData(dxfArc: DxfArc): ArcData {
  return {
    origin: {x: dxfArc.x, y: dxfArc.y},
    radius: dxfArc.r,
    startAngle: dxfArc.startAngle,
    endAngle: dxfArc.endAngle
  }
}

export function dxfCircleToCircleData(dxfCircle: DxfCircle): CircleData {
    return {
        origin: {x: dxfCircle.x, y: dxfCircle.y},
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

    console.log('Ellipse data', data);

    return data;
}

export function dxfLineToLineData(dxfLine: DxfLine): LineData {
  return {
      startPoint: { x: dxfLine.start?.x, y: dxfLine.start?.y },
      endPoint: { x: dxfLine.end?.x, y: dxfLine.end?.y }
  }
}

export function dxfPointToPointData(dxfPoint: DxfPoint): PointData {
  return {x: dxfPoint.x, y: dxfPoint.y};
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
        return new Line({startPoint, endPoint});
    }
}

export function dxfSplineToQuadraticCurveData(dxfSpline: DxfSpline): QuadraticCurveData {
  return {
      startPoint: dxfSpline.controlPoints[0],
      controlPoint: dxfSpline.controlPoints[1],
      endPoint: dxfSpline.controlPoints[2]
  }
}

export function dxfSplineToCubicCurveData(dxfSpline: DxfSpline): CubicCurveData {
  return {
      startPoint: dxfSpline.controlPoints[0],
      control1Point: dxfSpline.controlPoints[1], 
      control2Point: dxfSpline.controlPoints[2],
      endPoint: dxfSpline.controlPoints[3]
  }
}

export function dxfSplineToSplineData(dxfSpline: DxfSpline): SplineData {
  return { controlPoints: dxfSpline.controlPoints }
}

export function dxfBulgeToArcData(startPoint: DxfPoint, endPoint: DxfPoint, bulge: number): ArcData {
    
    const theta = 4 * Math.atan(bulge);
    
    const dx = endPoint.x - startPoint.x;
    const dy = endPoint.y - startPoint.y;
    const chord = Math.sqrt(dx * dx + dy * dy);
    
    const radius = Math.abs(chord / (2 * Math.sin(theta / 2)));
    
    const chordMidX = (startPoint.x + endPoint.x) / 2;
    const chordMidY = (startPoint.y + endPoint.y) / 2;
    const perpDist = radius * Math.cos(theta / 2);
    const perpAngle = Math.atan2(dy, dx) + (bulge > 0 ? Math.PI/2 : -Math.PI/2);
    
    const centerX = chordMidX + perpDist * Math.cos(perpAngle);
    const centerY = chordMidY + perpDist * Math.sin(perpAngle);
    
    const startAngle = Math.atan2(startPoint.y - centerY, startPoint.x - centerX);
    const endAngle = Math.atan2(endPoint.y - centerY, endPoint.x - centerX);

    return {
        origin: { x: centerX, y: centerY },
        radius,
        startAngle,
        endAngle
    };
}

export function dxfEntityTransformToTransformData(transform): TransformData {
    return {
        translateX: transform.x ?? 0,
        translateY: transform.y ?? 0,
        rotateAngle: transform.rotation ? (transform.rotation * Math.PI / 180) : 0,
        scaleX: transform.scaleX ?? 1,
        scaleY: transform.scaleY ?? 1,
        extrusionZ: transform.extrusionZ ?? 1
    };
}

/**
 * Returns a conversion factor to scale DXF measurement to screen pixels.
 */
export function dxfMeasurementToPx(unit: number|undefined) {
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