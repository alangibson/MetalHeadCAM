<script lang="ts">
    import type { Plan } from "$lib/domain/planning/plan/plan";
    import { Part } from "$lib/domain/planning/part/part";
    import { PlanningStageState } from "./state.svelte";
    import TreeGrid from "../gui/TreeGrid.svelte";
    import type { SvelteSet } from "svelte/reactivity";
    import type { Cut } from "$lib/domain/planning/cut/cut";
    import type { WbNodeData } from 'wunderbaum';
    // import types from 'wunderbaum';

    let { plan }: { plan: Plan|undefined } = $props();

    // TODO this won't actually be reactive because Plan is a non-reactive class
    // TODO apply WbNodeData typing
    let treeGridItems = $derived(() => {
        const items = [];
        for (const part of plan?.parts) {
            const partItem = {
                title: 'Part',
                key: part.id,
                expanded: true,
                children: [],
                entity: part
            };
            for (const cut of part.cuts) {
                const cutItem = {
                    title: 'Cut',
                    key: cut.id,
                    children: [],
                    entity: cut
                };
                for (const shape of cut.path.shapes) {
                    const shapeItem = {
                        key: shape.id,
                        title: shape.constructor.name,
                        entity: shape
                    };
                    cutItem.children.push(shapeItem);
                }
                partItem.children.push(cutItem);
            }
            items.push(partItem);
        }
        return items;
    });

    // TODO react to changes in PlanningStageState.selectedEntities
    // function selectTreeGridItems(selectedEntities: SvelteSet<Part|Cut>) {
    //     for (const entity of selectedEntities) {

    //     }
    // }

    // // Track expanded state of parts
    // let expandedParts = $state<Set<Part>>(new Set());

    // function togglePart(part: Part) {
    //     if (expandedParts.has(part)) {
    //         expandedParts.delete(part);
    //     } else {
    //         expandedParts.add(part);
    //     }
    // }

    // // Check if any shape in the part is selected
    // function isPartSelected(part: Part): boolean {
    //     return PlanningStageState.selectedEntities.has(part) || 
    //            part.cuts.some(cut => PlanningStageState.selectedEntities.has(cut));
    // }
</script>

<!-- <div class="plan-panel"> -->
<TreeGrid data={treeGridItems()} selected={PlanningStageState.selectedEntities}></TreeGrid>
<!-- </div> -->

<style>
    /* .plan-panel {
        border-radius: 4px;
    } */
</style>
