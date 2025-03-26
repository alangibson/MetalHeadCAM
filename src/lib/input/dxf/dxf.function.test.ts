import { describe, it, expect } from 'vitest';
import type { Point2D } from 'dxf/Common';
import { dxfBulgeToArcData, dxfEllipseToEllipseData, dxfPointsToShape } from './dxf.function';
import { Line } from '$lib/geometry/line/line';
import { Arc } from '$lib/geometry/arc/arc';
import type { Ellipse as DxfEllipse } from 'dxf/handlers/entities';

describe('bulgeToArc', () => {
    it('should convert points with positive bulge to arc parameters', () => {
        // Arrange
        const startPoint: Point2D & { bulge?: number } = { 
            x: 0, 
            y: 0,
            bulge: 1 // Bulge of 1 means a 90-degree arc
        };
        const endPoint: Point2D = { 
            x: 1, 
            y: 0 
        };

        // Act
        const arcData = dxfBulgeToArcData(startPoint, endPoint, startPoint.bulge);

        // Assert
        expect(arcData.radius).toBeCloseTo(0.5);
        expect(arcData.origin.x).toBeCloseTo(0.5);
        expect(arcData.origin.y).toBeCloseTo(0);
        expect(arcData.startAngle).toBeCloseTo(-Math.PI);
        expect(arcData.endAngle).toBeCloseTo(0);
    });

    it('should convert points with negative bulge to clockwise arc', () => {
        // Arrange
        const startPoint: Point2D & { bulge?: number } = { 
            x: 0, 
            y: 0,
            bulge: -1 // Negative bulge means clockwise arc
        };
        const endPoint: Point2D = { 
            x: 1, 
            y: 0 
        };

        // Act
        const arcData = dxfBulgeToArcData(startPoint, endPoint, startPoint.bulge);

        // Assert
        expect(arcData.radius).toBeCloseTo(0.5);
        expect(arcData.origin.x).toBeCloseTo(0.5);
        expect(arcData.origin.y).toBeCloseTo(0);
        expect(arcData.startAngle).toBeCloseTo(Math.PI);
        expect(arcData.endAngle).toBeCloseTo(0);
    });

    it('should handle zero bulge as straight line', () => {
        // Arrange
        const startPoint: Point2D = { x: 0, y: 0 };
        const endPoint: Point2D = { x: 1, y: 0 };

        // Act
        const arcData = dxfBulgeToArcData(startPoint, endPoint, null);

        // Assert
        expect(arcData.radius).toBeCloseTo(Infinity);
    });
});

describe('dxfPointsToShape', () => {
    it('should create Line when no bulge is present', () => {
        // Arrange
        const startPoint: Point2D = { x: 0, y: 0 };
        const endPoint: Point2D = { x: 1, y: 1 };

        // Act
        const shape = dxfPointsToShape(startPoint, endPoint);

        // Assert
        expect(shape).toBeInstanceOf(Line);
        const line = shape as Line;
        expect(line.startPoint).toEqual(startPoint);
        expect(line.endPoint).toEqual(endPoint);
    });

    it('should create Arc when bulge is present and non-zero', () => {
        // Arrange
        const startPoint: Point2D & { bulge?: number } = { 
            x: 0, 
            y: 0,
            bulge: 1
        };
        const endPoint: Point2D = { x: 1, y: 0 };

        // Act
        const shape = dxfPointsToShape(startPoint, endPoint);

        // Assert
        expect(shape).toBeInstanceOf(Arc);
        const arc = shape as Arc;
        expect(arc.radius).toBeCloseTo(0.5);
        expect(arc.origin.x).toBeCloseTo(0.5);
        // expect(arc.origin.y).toBeCloseTo(0.5);
        expect(arc.origin.y).toBeCloseTo(0);
    });

    it('should create Line when bulge is zero', () => {
        // Arrange
        const startPoint: Point2D & { bulge?: number } = { 
            x: 0, 
            y: 0,
            bulge: 0
        };
        const endPoint: Point2D = { x: 1, y: 0 };

        // Act
        const shape = dxfPointsToShape(startPoint, endPoint);

        // Assert
        expect(shape).toBeInstanceOf(Line);
    });
});

describe('dxfEllipseToEllipseData', () => {
    it('should convert basic DXF ellipse data', () => {
        // Arrange
        const dxfEllipse: DxfEllipse = {
            type: 'ELLIPSE',
            x: 1,
            y: 2,
            majorX: 3,
            majorY: 0,
            axisRatio: 0.5,
            startAngle: 0,
            endAngle: Math.PI * 2
        };

        // Act
        const ellipseData = dxfEllipseToEllipseData(dxfEllipse);

        // Assert
        expect(ellipseData.origin).toEqual({ x: 1, y: 2 });
        expect(ellipseData.majorLength).toBeCloseTo(3);
        expect(ellipseData.minorLength).toBeCloseTo(1.5); // majorLength * axisRatio
        expect(ellipseData.rotation).toBeCloseTo(0);
        expect(ellipseData.startAngle).toBeCloseTo(0);
        expect(ellipseData.endAngle).toBeCloseTo(Math.PI * 2);
    });

    it('should handle rotated DXF ellipse', () => {
        // Arrange
        const dxfEllipse: DxfEllipse = {
            type: 'ELLIPSE',
            x: 0,
            y: 0,
            majorX: 2,
            majorY: 2, // This creates a 45-degree rotation
            axisRatio: 0.5,
            startAngle: 0,
            endAngle: Math.PI
        };

        // Act
        const ellipseData = dxfEllipseToEllipseData(dxfEllipse);

        // Assert
        expect(ellipseData.origin).toEqual({ x: 0, y: 0 });
        expect(ellipseData.majorLength).toBeCloseTo(2 * Math.SQRT2);
        expect(ellipseData.minorLength).toBeCloseTo(Math.SQRT2); // majorLength * axisRatio
        expect(ellipseData.rotation).toBeCloseTo(Math.PI / 4); // 45 degrees
        expect(ellipseData.startAngle).toBeCloseTo(0);
        expect(ellipseData.endAngle).toBeCloseTo(Math.PI);
    });

});
