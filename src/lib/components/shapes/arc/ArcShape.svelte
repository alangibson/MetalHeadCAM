<script lang="ts">
    import { inchesToPixels, mmToInches } from "$lib/components/stage.function";
    import type { ArcData } from "$lib/geometry/arc/arc.data";
    import { radiansToDegrees } from "$lib/geometry/arc/arc.function";
    import { Arc as KonvaArc } from "svelte-konva";

    let {
        geometry: arcData = $bindable<ArcData>(),
        strokeWidth = $bindable(1),
        stageScaleBy = $bindable(1),
        onmouseenter: onMouseEnter,
        onmouseleave: onMouseLeave,
        onclick: onClick,
    } = $props();
        
    // Map from ArcData to Konva.Arc
    let config = $state({
        x: arcData.origin.x,
        y: arcData.origin.y,
        innerRadius: arcData.radius,
        outerRadius: arcData.radius,
        angle: radiansToDegrees(arcData.endAngle - arcData.startAngle),
        rotation: radiansToDegrees(arcData.startAngle),
    });

    // Map from Konva.Arc to ArcData
    // TODO use ontransformend?
    $effect(() => {
        arcData.origin.x = config.x;
        arcData.origin.y = config.y;
        arcData.radius = config.outerRadius;
        // TODO others...
    });
</script>

<KonvaArc
    {...config}
    stroke="red"
    {strokeWidth}
    lineCap="round"
    lineJoin="round"
    onmouseenter={onMouseEnter}
    onmouseleave={onMouseLeave}
    onclick={onClick}
/>
