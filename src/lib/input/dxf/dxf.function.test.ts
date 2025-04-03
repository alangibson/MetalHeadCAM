import { describe, it, expect } from 'vitest';
import type { Point2D } from 'dxf/Common';
import { dxfBulgeToArcData, dxfBulgeToArcData2, dxfEllipseToEllipseData, dxfPointsToShape } from './dxf.function';
import { Line } from '$lib/geometry/line/line';
import { Arc } from '$lib/geometry/arc/arc';
import type { Ellipse as DxfEllipse } from 'dxf/handlers/entities';
import type { Shape } from '$lib/geometry/shape/shape';
import { ArcDirectionEnum } from '$lib/geometry/arc/arc.enum';
import { dxfBulgeArcDirection } from './dxf.function';
import type { ArcData } from '$lib/geometry/arc/arc.data';

describe('bulgeToArcData', () => {
    it('should convert points with positive bulge to arc parameters', () => {
        // Arrange
        const startPoint: Point2D & { bulge?: number } = { 
            x: 0, 
            y: 0,
            bulge: 1
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
        expect(new Arc(arcData).direction).toBe(ArcDirectionEnum.CCW)
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
        expect(new Arc(arcData).direction).toBe(ArcDirectionEnum.CW)
    });

    it('finds correct positive CCW rotation', () => {
        // Given
        const startPoint = {x: 125, y: 65, bulge: 0.996946572013};
        const endPoint = {x: 145, y: 25, bulge: -1.083470022789};
        // When
        const arcData = dxfBulgeToArcData(startPoint, endPoint, startPoint.bulge);
        // Then
        const arc = new Arc(arcData);
        expect(arc.direction).toBe(ArcDirectionEnum.CCW);
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

    it('should handle a polyshape of curves', () => {
        // Given
        // Taken from Polylinie.dxf
        const points = [
            {x: 250, y: 135, bulge: -0.78324052254},
            {x: 190, y: 65, bulge: 0.237682819753},
            {x: 125, y: 65, bulge: 0.996946572013},
            {x: 145, y: 25, bulge: -1.083470022789},
            {x: 155, y: 0, bulge: -0.288109626827},
            {x: 80, y: 20, bulge: -0.393146374019},
            {x: 80, y: 95, bulge: -0.404666201315},
            // {x: 175, y: 100, bulge: 0.480784896851},
            // {x: 230, y: 110, bulge: -3.87255013361},
            // {x: 101.636876489286, y: 121.972853738774, bulge: 1},
            // {x: 85, y: 160}
        ];

        // When
        const arc1: ArcData = dxfBulgeToArcData2(points[0], points[1], points[0].bulge);
        const arc2 = dxfBulgeToArcData2(points[1], points[2], points[1].bulge);
        const arc3 = dxfBulgeToArcData2(points[2], points[3], points[2].bulge);
        const arc4 = dxfBulgeToArcData2(points[3], points[4], points[3].bulge);
        const arc5 = dxfBulgeToArcData2(points[4], points[5], points[4].bulge);
        const arc6 = dxfBulgeToArcData2(points[5], points[6], points[5].bulge);

        // Then
        expect(arc1.direction).toBe(ArcDirectionEnum.CW);
        // TODO
        // expect(arc1.startAngle).toBeCloseTo();
        // expect(arc1.endAngle).toBeCloseTo();
        expect(arc2.direction).toBe(ArcDirectionEnum.CCW);
        // TODO
        // expect(arc2.startAngle).toBeCloseTo();
        // expect(arc2.endAngle).toBeCloseTo();
        expect(arc3.direction).toBe(ArcDirectionEnum.CCW);
        expect(arc4.direction).toBe(ArcDirectionEnum.CW);
        expect(arc5.direction).toBe(ArcDirectionEnum.CW);
        expect(arc6.direction).toBe(ArcDirectionEnum.CW);
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
