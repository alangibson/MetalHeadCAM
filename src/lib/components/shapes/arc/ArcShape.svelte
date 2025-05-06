<script lang="ts">
    import { radiansToDegrees } from "$lib/geometry/angle/angle.function";
    import type { Arc } from "$lib/geometry/arc/arc";
    import { Arc as KonvaArc } from "svelte-konva";
    import ShapeBearing from "../markers/ShapeBearing.svelte";
    import { DEFAULT_COLOR_ARC } from "$lib/domain/importing/config/defaults";

    let {
        geometry: arc = $bindable<Arc>(),
        strokeWidth = $bindable(1),
        stageScaleBy = $bindable(1),
        onmouseenter: onMouseEnter,
        onmouseleave: onMouseLeave,
        onclick: onClick,
    } = $props();
        
    // Map from ArcData to Konva.Arc
    let config = $state({
        x: arc.origin.x,
        y: arc.origin.y,
        innerRadius: arc.radius,
        outerRadius: arc.radius,
        angle: radiansToDegrees(arc.angle),
        rotation: radiansToDegrees(arc.rotation),
    });

    // Map from Konva.Arc to ArcData
    // TODO use ontransformend?
    $effect(() => {
        arc.origin.x = config.x;
        arc.origin.y = config.y;
        arc.radius = config.outerRadius;
        // TODO others...
    });
</script>

<KonvaArc
    {...config}
    stroke={DEFAULT_COLOR_ARC}
    {strokeWidth}
    lineCap="round"
    lineJoin="round"
    onmouseenter={onMouseEnter}
    onmouseleave={onMouseLeave}
    onclick={onClick}
/>
<ShapeBearing
    shape={arc}
    {strokeWidth}
></ShapeBearing>