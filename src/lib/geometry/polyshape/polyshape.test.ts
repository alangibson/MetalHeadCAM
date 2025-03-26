import { describe, it, expect } from 'vitest';
import { polyshapeIsClosed } from './polyshape.function';
import { Line } from '../line/line';
import { Point } from '../point/point';
import { Polyshape } from './polyshape';

describe('polyshapeIsClosed', () => {
    it('should return true when start point equals end point', () => {
        // Arrange
        const startPoint = new Point({ x: 0, y: 0 });
        const midPoint = new Point({ x: 1, y: 1 });
        const endPoint = new Point({ x: 0, y: 0 }); // Same as start
        
        const polyshape = new Polyshape({
            shapes: [
                new Line({ startPoint, endPoint: midPoint }),
                new Line({ startPoint: midPoint, endPoint })
            ]
        });

        // Act
        const result = polyshapeIsClosed(polyshape);

        // Assert
        expect(result).toBe(true);
    });

    it('should return false when start point differs from end point', () => {
        // Arrange
        const startPoint = new Point({ x: 0, y: 0 });
        const midPoint = new Point({ x: 1, y: 1 });
        const endPoint = new Point({ x: 2, y: 2 }); // Different from start
        
        const polyshape = new Polyshape({
            shapes: [
                new Line({ startPoint, endPoint: midPoint }),
                new Line({ startPoint: midPoint, endPoint })
            ]
        });

        // Act
        const result = polyshapeIsClosed(polyshape);

        // Assert
        expect(result).toBe(false);
    });
});
