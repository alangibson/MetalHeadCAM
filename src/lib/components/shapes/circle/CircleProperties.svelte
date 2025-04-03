<script lang="ts">
    import type Konva from "konva";

    let {
        konvaShape
    }: { konvaShape: Konva.Circle } = $props();

    // This block makes the Konva shape reactive
    let originX = $state<number>(konvaShape.x());
    let originY = $state<number>(konvaShape.y());
    let radius = $state<number>(konvaShape.radius());

    $effect(() => {
        konvaShape.x(originX);
        konvaShape.y(originY);
        konvaShape.radius(radius);
        konvaShape.fire('transformend');
        konvaShape.fire('dragend');
    });
</script>

<table>
    <tbody>
        <tr>
            <td>type</td>
            <td class="value">Circle</td>
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
            <td>radius</td>
            <td class="value">
                <input type="number" bind:value={radius}/>
            </td>
        </tr>
    </tbody>
</table> 