<script lang="ts">
    import type Konva from "konva";

    let {
        konvaShape
    }: { konvaShape: Konva.Ellipse } = $props();

    // This block makes the Konva shape reactive
    let originX = $state<number>(konvaShape.x());
    let originY = $state<number>(konvaShape.y());
    let radiusX = $state<number>(konvaShape.radiusX());
    let radiusY = $state<number>(konvaShape.radiusY());
    let rotation = $state<number>(konvaShape.rotation());

    $effect(() => {
        konvaShape.x(originX);
        konvaShape.y(originY);
        konvaShape.radiusX(radiusX);
        konvaShape.radiusY(radiusY);
        konvaShape.rotation(rotation);
        konvaShape.fire('transformend');
        konvaShape.fire('dragend');
    });
</script>

<table>
    <tbody>
        <tr>
            <td>type</td>
            <td class="value">Ellipse</td>
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
            <td>major radius</td>
            <td class="value">
                <input type="number" bind:value={radiusX}/>
            </td>
        </tr>
        <tr>
            <td>minor radius</td>
            <td class="value">
                <input type="number" bind:value={radiusY}/>
            </td>
        </tr>
        <tr>
            <td>rotation</td>
            <td class="value">
                <input type="number" bind:value={rotation}/>
            </td>
        </tr>
    </tbody>
</table> 