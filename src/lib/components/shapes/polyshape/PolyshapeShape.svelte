<script lang="ts">
    import { Path as KonvaPath } from "svelte-konva";
    import { ArcDirectionEnum } from "$lib/geometry/arc/arc.enum";
    import { Arc } from "$lib/geometry/arc/arc";
    import { Line } from "$lib/geometry/line/line";
    import type { Polyshape } from "$lib/geometry/polyshape/polyshape";
    import { arcToSvgFlags } from "$lib/geometry/arc/arc.function";

    let {
        geometry: polyshape = $bindable<Polyshape>(),
        onmouseenter: onMouseEnter,
        onmouseleave: onMouseLeave,
        onclick: onClick,
    } = $props();

    function buildPathData(polyshape: Polyshape): string {
        let pathData = '';
        const shapes = polyshape.shapes;

        // Start path at first point
        const firstShape = shapes[0];
        pathData += `M ${firstShape.startPoint.x} ${firstShape.startPoint.y}`;

        // Add each shape to the path
        for (const shape of shapes) {
            if (shape instanceof Line) {
                const pathLine = ` L ${shape.endPoint.x} ${shape.endPoint.y}`;
                pathData += pathLine;
            } else if (shape instanceof Arc) {
                const rx = shape.radius;
                const ry = shape.radius;
                const xAxisRotation = 0;
                let [largeArcFlag, sweepFlag] = arcToSvgFlags(
                    shape.startAngle,
                    shape.endAngle,
                    shape.direction
                );
                const pathArc = ` A ${rx} ${ry} ${xAxisRotation} ${largeArcFlag} ${sweepFlag} ${shape.endPoint.x} ${shape.endPoint.y}`;
                pathData += pathArc;
            }
        }

        if (polyshape.isClosed) {
            pathData += ' Z';
        }

        console.log(pathData);

        return pathData;
    }

    

    // Map from PolyshapeData to Konva.Path
    let config = $state({
        data: buildPathData(polyshape)
    });

    // Update path data when shapes change
    $effect(() => {
        // FIXME this is wrong
        config.data = buildPathData(polyshape);
    });
</script>

<KonvaPath
    {...config}
    stroke="brown"
    strokeWidth={1}
    lineCap="round"
    lineJoin="round"
    onmouseenter={onMouseEnter}
    onmouseleave={onMouseLeave}
    onclick={onClick}
/> 