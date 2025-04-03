<script lang="ts">
    import type { EllipseData } from "$lib/geometry/ellipse/ellipse.data";
    import { Ellipse as KonvaEllipse } from "svelte-konva";
    import { degreesToRadians, radiansToDegrees } from "$lib/geometry/arc/arc.function";

    let {
        geometry: ellipseData = $bindable<EllipseData>(),
        onmouseenter: onMouseEnter,
        onmouseleave: onMouseLeave,
        onclick: onClick,
    } = $props();

    // Map from EllipseData to Konva.Ellipse
    let config = $state({
        x: ellipseData.origin.x,
        y: ellipseData.origin.y,
        radiusX: ellipseData.majorLength,
        radiusY: ellipseData.minorLength,
        rotation: radiansToDegrees(ellipseData.rotation)
    });

    // Map from Konva.Ellipse to EllipseData
    $effect(() => {
        ellipseData.origin.x = config.x;
        ellipseData.origin.y = config.y;
        ellipseData.majorLength = config.radiusX;
        ellipseData.minorLength = config.radiusY;
        ellipseData.rotation = degreesToRadians(config.rotation);
    });
</script>

<KonvaEllipse
    {...config}
    stroke="purple"
    strokeWidth={1}
    onmouseenter={onMouseEnter}
    onmouseleave={onMouseLeave}
    onclick={onClick}
/> 