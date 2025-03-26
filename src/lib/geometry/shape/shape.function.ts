// In radians
export function rotateAngleNormalized(angle: number, rotation: number) {
    const TWO_PI = Math.PI * 2;
    return ((angle + rotation) % TWO_PI + TWO_PI) % TWO_PI
}