<script lang="ts">
    import type { Entity } from "$lib/entity";
    import type { SvelteSet } from "svelte/reactivity";
    import type {
        WbActivateEventType,
        WbDeactivateEventType,
        WbNodeEventType,
        WbNodeData
    } from "types"; // wunderbaum
    import { Wunderbaum } from "wunderbaum";
    import "wunderbaum/dist/wunderbaum.css";
    // TODO Bootstrap icons are imported in app.html. Do that here somehow.

    let {
        data,
        selected,
    }: { data: WbNodeData[]; selected: SvelteSet<Entity> } = $props();

    let tree: Wunderbaum = $state();

    function load() {
        tree = new Wunderbaum({
            element: document.getElementById("plan-tree"),
            source: data,
            checkbox: true,
            activate(e: WbActivateEventType) {
                console.log("activate", e);
            },
            deactivate(e: WbDeactivateEventType) {
                console.log("deactivate", e);
            },
            select(e: WbNodeEventType) {
                if (e.node.selected) {
                    console.log('Selecting', e.node.data.entity);
                    selected.add(e.node.data.entity);
                } else {
                    console.log('Deselecting', e.node.data.entity);
                    selected.delete(e.node.data.entity);
                }
            },
        });
    }

    $effect(() => {
        for (const entity of selected) {

            // Find and select a node by its key
            const node = tree.findKey(entity.id);
            if (node) {
                // node.setActive();
                // node.toggleSelected();
                node.setSelected(true);
            }

            // TODO Not working. Doesn't seem like reactivity is triggered.
            // Deselect all nodes that are not in the selection list
            tree.visit((node) => {
                if (!selected.has(node.data.entity)) {
                    node.setSelected(false);
                }
            });
        }
    });
</script>

<div id="plan-tree" use:load></div>

<style>
</style>
