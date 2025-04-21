<script lang="ts">
    import { radiansToDegrees } from "$lib/geometry/angle/angle.function";
    import type { AngleRadians } from "$lib/geometry/angle/angle.type";
    import type { PointData } from "$lib/geometry/point/point.data";
    import { Wedge as KonvaWedge } from "svelte-konva";

    let {
        point,
        bearing,
        strokeWidth,
        strokeColor,
    }: {
        point: PointData;
        bearing: AngleRadians;
        strokeWidth: number;
        strokeColor: string;
    } = $props();
</script>

<KonvaWedge
    x={point.x}
    y={point.y}
    {strokeWidth}
    stroke={strokeColor}
    radius={strokeWidth * 10}
    angle={90}
    rotation={radiansToDegrees(bearing) - 90 / 2 - 180}
></KonvaWedge>
