<script lang="ts">
    import type { Plan } from "$lib/domain/planning/plan/plan";
    import {
        Stage as KonvaStage,
        Layer as KonvaLayer,
        Group as KonvaGroup,
    } from "svelte-konva";
    import PolyshapeShape from "../shapes/polyshape/PolyshapeShape.svelte";
    import Konva from "konva";

    let { 
        plan,
        zoomBy = $bindable(1.0)
     }: { plan: Plan | undefined, zoomBy: number } = $props();
    
    // Reference to underlying Konva.Stage object
    let konvaStage = $state<Konva.Stage>();
    let konvaStageWidth = $state(800);
    let konvaStageHeight = $state(800);
    // Gets set in onMount
    let konvaStageComponent;
</script>

<KonvaStage
    bind:this={konvaStageComponent}
    width={konvaStageWidth}
    height={konvaStageHeight}
>
    <KonvaLayer>
        {#each plan?.parts as part, part_i}
            <KonvaGroup>
                {#each part.cuts as cut, cut_i}
                    <!-- TODO render rapid in -->
                    <!-- TODO render lead in -->
                    <!-- TODO render path -->
                    <PolyshapeShape
                        geometry={cut.path}
                        onmouseenter={null}
                        onmouseleave={null}
                        onclick={null}
                    ></PolyshapeShape>
                    <!-- TODO render offset -->
                    <!-- TODO render lead out -->
                    <!-- TODO render rapid out -->
                {/each}
            </KonvaGroup>
        {/each}
    </KonvaLayer>
</KonvaStage>
