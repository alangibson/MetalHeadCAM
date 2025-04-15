<script lang="ts">
    import type { Plan } from "$lib/domain/planning/plan/plan";
    import type { Part } from "$lib/domain/planning/part/part";
    import { PlanningStageState } from "./state.svelte";

    let { plan }: { plan: Plan|undefined } = $props();

    // Track expanded state of parts
    let expandedParts = $state<Set<Part>>(new Set());

    function togglePart(part: Part) {
        if (expandedParts.has(part)) {
            expandedParts.delete(part);
        } else {
            expandedParts.add(part);
        }
    }

    // Check if any shape in the part is selected
    function isPartSelected(part: Part): boolean {
        return PlanningStageState.selectedEntities.has(part) || 
               part.cuts.some(cut => PlanningStageState.selectedEntities.has(cut));
    }
</script>

<div class="plan-panel">
    <h3>Plan Items</h3>
    <div class="part-count">Total Parts: {plan?.parts?.length}</div>
    <ul class="part-list">
        {#each plan?.parts as part}
            <li>
                <!-- svelte-ignore event_directive_deprecated -->
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <div 
                    class="part-header" 
                    class:selected={isPartSelected(part)}
                    on:click={() => togglePart(part)}
                >
                    <span class="expand-icon">{expandedParts.has(part) ? "▼" : "▶"}</span>
                    <span class="part-name">Part</span>
                    <span class="cut-count">({part?.cuts?.length} cuts)</span>
                </div>
                <ul class="cut-list" class:expanded={true}>
                    {#each part.cuts as cut}
                        <li class="cut-item">
                            <div class="cut-type">{cut.constructor.name}</div>
                            <div class="cut-details">
                                <ul class="shape-list">
                                    {#each cut.path.shapes as shape}
                                        <li class="shape-item">
                                            {shape.type}
                                        </li>
                                    {/each}
                                </ul>
                            </div>
                        </li>
                    {/each}
                </ul>
            </li>
        {/each}
    </ul>
</div>

<style>
    .plan-panel {
        border-radius: 4px;
    }

    .part-list {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .part-header {
        display: flex;
        align-items: center;
        padding: 0.5rem;
        border-radius: 4px;
        margin-bottom: 0.25rem;
    }

    .part-header:hover {
    }

    .expand-icon {
        margin-right: 0.5rem;
    }

    .part-name {
        flex: 1;
    }

    .part-count {
        margin-bottom: 1rem;
    }

    .cut-count {
        margin-left: 0.5rem;
    }

    .cut-list {
        padding-left: 2rem;
        margin: 0.25rem 0;
        list-style: none;
        display: none;
    }

    .cut-list.expanded {
        display: block;
    }

    .cut-item {
    }

    .cut-type {
        padding: 0.2rem 0.4rem;
        border-radius: 3px;
    }

    .cut-details {
    }
    
    .shape-list {
        list-style: none;
    }

    .part-header.selected {
        background-color: #ffeb3b40;
    }
</style>
