import { describe, it, expect } from 'vitest';
import { Polyshape } from './polyshape';
import { Circle } from '../circle/circle';
import { Point } from '../point/point';
import { Line } from '../line/line';
import { Arc } from '../arc/arc';
import { GeometryTypeEnum, OrientationEnum } from '../geometry/geometry.enum';

describe('Polyshape', () => {
    describe('contains', () => {
        it('should return true when a circle is inside a pentagon', () => {
            // Create a pentagon centered at (0,0) with radius 10
            const pentagonPoints = Array.from({ length: 5 }, (_, i) => {
                const angle = (i * 2 * Math.PI) / 5;
                return new Point({
                    x: 10 * Math.cos(angle),
                    y: 10 * Math.sin(angle)
                });
            });

            // Create lines connecting the points to form a pentagon
            const pentagonShapes = pentagonPoints.map((point, i) => {
                const nextPoint = pentagonPoints[(i + 1) % 5];
                return new Line({
                    startPoint: point,
                    endPoint: nextPoint
                });
            });

            const pentagon = new Polyshape({
                shapes: pentagonShapes
            });

            // Create a circle inside the pentagon
            const circle = new Circle({
                origin: new Point({ x: 0, y: 0 }),
                radius: 5 // Smaller than the pentagon's radius
            });

            // Convert circle to a Polyshape by creating lines between tessellated points
            const circlePoints = circle.tessellate(); // Use 32 points for a good approximation
            const circleShapes = circlePoints.map((point, i) => {
                const nextPoint = circlePoints[(i + 1) % circlePoints.length];
                return new Line({
                    startPoint: point,
                    endPoint: nextPoint
                });
            });

            const circlePolyshape = new Polyshape({
                shapes: circleShapes
            });

            // Test that the pentagon contains the circle
            expect(pentagon.contains(circlePolyshape)).toBe(true);
        });

        it('should return true when a circle is inside a slot shape', () => {
            // Create a slot shape using lines and arcs
            const slotShapes = [
                // Bottom line
                new Line({
                    startPoint: new Point({ x: -10, y: -5 }),
                    endPoint: new Point({ x: 10, y: -5 })
                }),
                // Right arc
                new Arc({
                    origin: new Point({ x: 10, y: 0 }),
                    radius: 5,
                    startAngle: -Math.PI/2, // -90 degrees
                    endAngle: Math.PI/2,    // 90 degrees
                    orientation: OrientationEnum.CLOCKWISE
                }),
                // Top line
                new Line({
                    startPoint: new Point({ x: 10, y: 5 }),
                    endPoint: new Point({ x: -10, y: 5 })
                }),
                // Left arc
                new Arc({
                    origin: new Point({ x: -10, y: 0 }),
                    radius: 5,
                    startAngle: Math.PI/2,  // 90 degrees
                    endAngle: -Math.PI/2,   // -90 degrees
                    orientation: OrientationEnum.CLOCKWISE
                })
            ];

            const slot = new Polyshape({
                shapes: slotShapes
            });

            // Create a circle inside the slot
            const circle = new Circle({
                origin: new Point({ x: 0, y: 0 }),
                radius: 3 // Smaller than the slot's dimensions
            });

            // Convert circle to a Polyshape
            const circlePoints = circle.tessellate();
            const circleShapes = circlePoints.map((point, i) => {
                const nextPoint = circlePoints[(i + 1) % circlePoints.length];
                return new Line({
                    startPoint: point,
                    endPoint: nextPoint
                });
            });

            const circlePolyshape = new Polyshape({
                shapes: circleShapes
            });

            // Test that the slot contains the circle
            expect(slot.contains(circlePolyshape)).toBe(true);
        });
    });
});
