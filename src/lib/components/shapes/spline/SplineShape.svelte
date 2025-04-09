<script lang="ts">
    import type { SplineData } from "$lib/geometry/spline/spline.data";
    import { Line as KonvaLine, Path as KonvaPath } from "svelte-konva";
    import { browser } from "$app/environment";
    import { onMount } from "svelte";

    let {
        geometry: splineData = $bindable<SplineData>(),
        stageScaleBy = $bindable(1),
        strokeWidth = $bindable(1),
        onmouseenter: onMouseEnter,
        onmouseleave: onMouseLeave,
        onclick: onClick,
    } = $props();

    let config = $state({
        data: "",
    });

    // Will hold the verb-nurbs module once loaded
    let verb: any;
    onMount(async () => {
        if (browser) {
            // Dynamic import to avoid SSR issues
            verb = (await import("verb-nurbs")).default;

            // Create NURBS curve from control points
            const degree = splineData.controlPoints.length - 1;
            // TODO get splineData.knots from DXF
            const knots = Array(degree + 1)
                .fill(0)
                .concat(Array(degree + 1).fill(1));
            const controlPoints = splineData.controlPoints.map((point) => [
                point.x,
                point.y,
                0,
            ]);
            const weights = Array(controlPoints.length).fill(1);
            const nurbsCurve =
                new verb.geom.NurbsCurve.byKnotsControlPointsWeights(
                    degree,
                    knots,
                    controlPoints,
                    weights,
                );

            // cubicCurves is a 1 element array of verb.core.NurbsCurveData
            const cubicCurves = verb.eval.Modify.decomposeCurveIntoBeziers(
                nurbsCurve.asNurbs(),
            );

            // Convert cubic curves to SVG path data
            let pathData = "";
            // Length of controlPoints is array, so they must be cubic bezier curves.
            for (let i = 0; i < cubicCurves[0].controlPoints.length; i += 4) {
                const points = cubicCurves[0].controlPoints.slice(i, i + 4);
                // Each point is [x, y, z, w] where w is the weight
                const [p0, p1, p2, p3] = points;
                // Convert to SVG path data format
                if (i === 0) {
                    pathData += `M ${p0[0]} ${p0[1]} `;
                }
                pathData += `C ${p1[0]} ${p1[1]}, ${p2[0]} ${p2[1]}, ${p3[0]} ${p3[1]} `;
            }
            config.data = pathData;
        }
    });
</script>

<KonvaPath
    {...config}
    stroke="magenta"
    {strokeWidth}
    lineCap="round"
    lineJoin="round"
    onmouseenter={onMouseEnter}
    onmouseleave={onMouseLeave}
    onclick={onClick}
/>
