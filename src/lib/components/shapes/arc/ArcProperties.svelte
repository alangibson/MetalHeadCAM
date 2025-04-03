<script lang="ts">
    import { degreesToRadians } from "$lib/geometry/arc/arc.function";
    import type Konva from "konva";
    import { shapes } from "konva/lib/Shape";

    let {
        konvaShape
    }: { konvaShape: Konva.Arc } = $props();

    // This block makes the Konva shape reactive
    let originX = $state<number>(konvaShape.x());
    let originY = $state<number>(konvaShape.y());
    let sweepAngle = $state<number>(konvaShape.angle());
    let rotation = $state<number>(konvaShape.rotation());
    let radius = $state<number>(konvaShape.outerRadius());
    $effect(() => {
        konvaShape.x(originX);
        konvaShape.y(originY);
        konvaShape.angle(sweepAngle);
        konvaShape.rotation(rotation);
        konvaShape.innerRadius(radius);
        konvaShape.outerRadius(radius);
        konvaShape.fire('transformend');
        konvaShape.fire('dragend');
    });
</script>

<table>
    <tbody>
        <tr>
            <td>type</td>
            <td class="value">Arc</td>
        </tr>
        <tr>
            <td>index</td>
            <td class="value">
                {konvaShape.index}
            </td>
        </tr>
        <tr>
            <td>origin point x</td>
            <td class="value">
                <input type="number" bind:value={originX}/>
            </td>
        </tr>
        <tr>
            <td>origin point y</td>
            <td class="value">
                <input type="number" bind:value={originY}/>
            </td>
        </tr>
        <tr>
            <td>sweep angle</td>
            <td class="value">
                <input type="number" bind:value={sweepAngle}/>
            </td>
        </tr>
        <tr>
            <td>rotation</td>
            <td class="value">
                <input type="number" bind:value={rotation}/>
            </td>
        </tr>
        <tr>
            <td>radius</td>
            <td class="value">
                <input type="number" bind:value={radius}/>
            </td>
        </tr>
    </tbody>
</table>