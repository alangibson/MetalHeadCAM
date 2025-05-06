<script lang="ts">
    import type { SplineData } from "$lib/geometry/spline/spline.data";
    import { Path as KonvaPath } from "svelte-konva";
    import verb from "verb-nurbs";
    import type { PointData } from "$lib/geometry/point/point.data";
    import type { Spline } from "$lib/geometry/spline/spline";
    import type { S } from "vitest/dist/chunks/config.d.DevWltVl.js";
    import { splineSvgPathCommand } from "./spline.function";
    import ShapeBearing from "../markers/ShapeBearing.svelte";
    import { DEFAULT_COLOR_SPLINE } from "$lib/domain/importing/config/defaults";

    let {
        geometry: spline = $bindable<Spline>(),
        stageScaleBy = $bindable(1),
        strokeWidth = $bindable(1),
        onmouseenter: onMouseEnter,
        onmouseleave: onMouseLeave,
        onclick: onClick,
    } = $props();

    let config = $state({
        data: "",
    });

    $effect(() => {
        const componentSplines: Spline[] = spline.decompose();
        config.data = componentSplines.reduce(
            (data: string, componentSpline: Spline) =>
                data += splineSvgPathCommand(componentSpline),
            "",
        );
    });
</script>

<KonvaPath
    {...config}
    stroke={DEFAULT_COLOR_SPLINE}
    {strokeWidth}
    lineCap="round"
    lineJoin="round"
    onmouseenter={onMouseEnter}
    onmouseleave={onMouseLeave}
    onclick={onClick}
/>

<ShapeBearing
    shape={spline}
    {strokeWidth}
></ShapeBearing>