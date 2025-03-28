<script lang="ts">
    import Konva from "konva";
    import { StageGui } from "$lib/gui/stage";
    import { DXFConverter } from "$lib/input/dxf/dxf";
    import { SvelteSet } from 'svelte/reactivity';

    let {
        drawing,
        scaleBy = $bindable(1.0),
        konvaStagePointerX = $bindable(0),
        konvaStagePointerY = $bindable(0),
        stagePointerX = $bindable(0),
        stagePointerY = $bindable(0),
        selectedKonvaShapes = $bindable<SvelteSet<Konva.Shape>>(new SvelteSet())
    } = $props();
    let container = $state();; // bound later

    $effect(() => {
        if (drawing) {
            // Populate Konva Stage
            const konvaStageWidth = 800;
            const konvaStageHeight = 800;
            // const container = document.getElementById("konva-container");
            const konvaStage = new Konva.Stage({
                container,
                width: container?.clientWidth ?? konvaStageWidth,
                height: konvaStageHeight,
                draggable: true,
            });
            // Track pointer position
            konvaStage.on("pointermove", () => {
                const pos = konvaStage.getPointerPosition();
                // Origin at top-left
                // Apply scale by so that coordinates of shapes don't change
                konvaStagePointerX = pos?.x / scaleBy;
                konvaStagePointerY = pos?.y / scaleBy;
                // Origin at bottom-left
                // Convert to bottom-left origin by flipping Y coordinate
                stagePointerX = konvaStagePointerX;
                stagePointerY = konvaStageHeight - konvaStagePointerY;
            });
            // Track scaling
            konvaStage.on("wheel", (e) => {
                // Prevent default scroll behavior and stop propagation
                e.evt.preventDefault();
                e.evt.stopPropagation();

                const MIN_ZOOM = 0.1; // Prevent going below 10% zoom
                const MAX_ZOOM = 5.0; // Cap at 500% zoom
                const ZOOM_STEP = 0.05; // 5% increments

                const oldScale = konvaStage.scaleX();
                const zoomFactor = oldScale / scaleBy;

                // Determine zoom direction and update scaleBy in 0.05 increments
                if (e.evt.deltaY < 0) {
                    scaleBy = Math.min(scaleBy + ZOOM_STEP, MAX_ZOOM);
                } else {
                    scaleBy = Math.max(scaleBy - ZOOM_STEP, MIN_ZOOM);
                }

                // Apply scale while preserving sign
                const newScale = scaleBy * zoomFactor;
                const scaleX = newScale * Math.sign(konvaStage.scaleX());
                const scaleY = newScale * Math.sign(konvaStage.scaleY());

                konvaStage.scale({ x: scaleX, y: scaleY });
            });

            DXFConverter.convertDrawingToKonvaLayers(drawing).forEach(
                (layer) => {

                    for (const konvaShape of layer.children) {
                        
                        let strokeLocked = false;
                        let lastStroke = 'black';

                        konvaShape.on('mouseenter', () => {
                            // highlight shape
                            if (!strokeLocked)
                                lastStroke = konvaShape.getAttr('stroke');
                                konvaShape.setAttr('stroke', 'yellow');
                        });

                        konvaShape.on('mouseleave', () => {
                            // remove highlight shape
                            if (!strokeLocked)
                                konvaShape.setAttr('stroke', lastStroke);
                        });

                        konvaShape.on('click', () => {
                            const gui = konvaShape.getAttr('gui');
                            console.log('konvaShape click', konvaShape, gui);
                            // Lock highlight
                            strokeLocked = !strokeLocked;
                            // Add to selected shape list
                            if (! selectedKonvaShapes.has(konvaShape))
                                selectedKonvaShapes.add(konvaShape);
                            else
                                selectedKonvaShapes.delete(konvaShape);
                        });
                    }

                    konvaStage.add(layer);
                },
            );
            const stage: StageGui = new StageGui(konvaStage);
            stage.reorient({ x: 0, y: 0 }, { x: 0, y: konvaStageHeight });
        }
    });
</script>

<div id="konva-container" bind:this={container}></div>
