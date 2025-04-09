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


// TODO bring back these tests
// const LARGE_SQUARE = new Polyshape([
// 	new Line({ startPoint: { x: 1, y: 1 }, endPoint: { x: 7, y: 1 } }),
// 	new Line({
// 		startPoint: { x: 7, y: 1 },
// 		endPoint: { x: 7, y: 7 }
// 	}),
// 	new Line({
// 		startPoint: { x: 7, y: 7 },
// 		endPoint: { x: 1, y: 7 }
// 	}),
// 	new Line({
// 		startPoint: { x: 1, y: 7 },
// 		endPoint: { x: 1, y: 1 }
// 	})
// ]);

// describe('polyshapeContains', () => {

//     it('simple polygon containment', () => {
//         // Given
//         // Polyshape A: Small square
//         const inner: Polyshape = new Polyshape([
//             new Line({ startPoint: { x: 3, y: 3 }, endPoint: { x: 5, y: 3 } }),
//             new Line({
//                 startPoint: { x: 5, y: 3 },
//                 endPoint: { x: 5, y: 5 }
//             }),
//             new Line({
//                 startPoint: { x: 5, y: 5 },
//                 endPoint: { x: 3, y: 5 }
//             }),
//             new Line({
//                 startPoint: { x: 3, y: 5 },
//                 endPoint: { x: 3, y: 3 }
//             })
//         ]);
//         // Polyshape B: Large square
//         const outer: Polyshape = LARGE_SQUARE;
//         // When
//         const isEnclosed = polyshapeContains(outer, inner);
//         // Then
//         expect(isEnclosed).toBe(true);
//     });
    
//     it('squares touching', () => {
//         // Given
//         // Polyshape A: Square touching Polyshape B at edge x=5
//         const inner: Polyshape = new Polyshape([
//             new Line({ startPoint: { x: 5, y: 3 }, endPoint: { x: 7, y: 3 } }),
//             new Line({
//                 startPoint: { x: 7, y: 3 },
//                 endPoint: { x: 7, y: 5 }
//             }),
//             new Line({
//                 startPoint: { x: 7, y: 5 },
//                 endPoint: { x: 5, y: 5 }
//             }),
//             new Line({
//                 startPoint: { x: 5, y: 5 },
//                 endPoint: { x: 5, y: 3 }
//             })
//         ]);
//         // Polyshape B: Large square
//         const outer: Polyshape = LARGE_SQUARE;
//         // When
//         const isEnclosed = polyshapeContains(outer, inner);
//         // Then
//         expect(isEnclosed).toBe(false);
//     });
    
//     it('line intersects', () => {
//         // Given
//         // Polyshape A: Square touching Polyshape B at edge x=5
//         const inner: Polyshape = new Polyshape([
//             new Line({ startPoint: { x: 0, y: 0 }, endPoint: { x: 8, y: 8 } })
//         ]);
//         // Polyshape B: Large square
//         const outer: Polyshape = LARGE_SQUARE;
//         // When
//         const isEnclosed = polyshapeContains(outer, inner);
//         // Then
//         expect(isEnclosed).toBe(false);
//     });
    
//     it('separate polygons', () => {
//         // Given
//         // Polyshape A: Small square
//         const inner: Polyshape = new Polyshape([
//             new Line({ startPoint: { x: 8, y: 8 }, endPoint: { x: 10, y: 8 } }),
//             new Line({
//                 startPoint: { x: 10, y: 8 },
//                 endPoint: { x: 10, y: 10 }
//             }),
//             new Line({
//                 startPoint: { x: 10, y: 10 },
//                 endPoint: { x: 8, y: 10 }
//             }),
//             new Line({
//                 startPoint: { x: 8, y: 10 },
//                 endPoint: { x: 8, y: 8 }
//             })
//         ]);
//         // Polyshape B: Large square
//         const outer: Polyshape = LARGE_SQUARE;
//         // When
//         const isEnclosed = polyshapeContains(outer, inner);
//         // Then
//         expect(isEnclosed).toBe(false);
//     });
    
//     it('enclosed arc', () => {
//         // Given
//         // Polyshape A: an arc
//         const inner: Polyshape = new Polyshape([
//             new Arc({
//                 center: { x: 4, y: 4 },
//                 radius: 1,
//                 startAngle: 0,
//                 endAngle: Math.PI
//             })
//         ]);
//         // Polyshape B: Large square
//         const outer: Polyshape = LARGE_SQUARE;
//         // When
//         const isEnclosed = polyshapeContains(outer, inner);
//         // Then
//         expect(isEnclosed).toBe(true);
//     });
    
//     it('partially enclosed circle', () => {
//         // Given
//         // Polyshape A: an arc
//         const inner: Polyshape = new Polyshape([
//             new Circle({
//                 center: { x: 4, y: 4 },
//                 radius: 10
//             })
//         ]);
//         // Polyshape B: Large square
//         const outer: Polyshape = LARGE_SQUARE;
//         // When
//         const isEnclosed = polyshapeContains(outer, inner);
//         // Then
//         expect(isEnclosed).toBe(false);
//     });
    
//     it('enclosed, self-intersecting polygon', () => {
//         // Given
//         // Polyshape A: an arc
//         const inner: Polyshape = new Polyshape([
//             new Line({ startPoint: { x: 3, y: 3 }, endPoint: { x: 5, y: 5 } }),
//             new Line({
//                 startPoint: { x: 5, y: 5 },
//                 endPoint: { x: 3, y: 5 }
//             }),
//             new Line({
//                 startPoint: { x: 3, y: 5 },
//                 endPoint: { x: 5, y: 3 }
//             }),
//             new Line({
//                 startPoint: { x: 5, y: 3 },
//                 endPoint: { x: 3, y: 3 }
//             })
//         ]);
//         // Polyshape B: Large square
//         const outer: Polyshape = LARGE_SQUARE;
//         // When
//         const isEnclosed = polyshapeContains(outer, inner);
//         // Then
//         expect(isEnclosed).toBe(true);
//     });
    
//     it('enclosed cubic curve', () => {
//         // Given
//         // Polyshape A: Closed cubic Bezier curve
//         const inner: Polyshape = new Polyshape([
//             new CubicCurve({
//                 startPoint: { x: 3, y: 4 },
//                 control1: { x: 4, y: 6 },
//                 control2: { x: 5, y: 2 },
//                 endPoint: { x: 6, y: 4 }
//             }),
//             new Line({
//                 startPoint: { x: 6, y: 4 },
//                 endPoint: { x: 3, y: 4 }
//             })
//         ]);
//         // Polyshape B: Large square
//         const outer: Polyshape = LARGE_SQUARE;
//         // When
//         const isEnclosed = polyshapeContains(outer, inner);
//         // Then
//         expect(isEnclosed).toBe(true);
//     });
    
//     it('enclosed open polyline', () => {
//         // Given
//         // Polyshape A: Closed cubic Bezier curve
//         const inner: Polyshape = new Polyshape([
//             new Line({
//                 startPoint: { x: 2, y: 2 },
//                 endPoint: { x: 2, y: 5 }
//             }),
//             new Line({
//                 startPoint: { x: 2, y: 5 },
//                 endPoint: { x: 5, y: 5 }
//             })
//         ]);
//         // Polyshape B: Large square
//         const outer: Polyshape = LARGE_SQUARE;
//         // When
//         const isEnclosed = polyshapeContains(outer, inner);
//         // Then
//         expect(isEnclosed).toBe(true);
//     });
    
//     it('same chains', () => {
//         // Given
//         // Polyshape A: same chain
//         const inner: Polyshape = new Polyshape([...LARGE_SQUARE.children]);
//         // Polyshape B: Large square
//         const outer: Polyshape = LARGE_SQUARE;
//         // When
//         const isEnclosed = polyshapeContains(outer, inner);
//         // Then
//         expect(isEnclosed).toBe(false);
//     });
    
// });
