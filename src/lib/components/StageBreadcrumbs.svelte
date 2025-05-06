<script lang="ts">
    import { StageEnum } from "./gui/stage.enum";

    // 1 = Project, 2 = Import, 3 = Drawing, 4 = Program
    let { activeStage = $bindable(2) }: { activeStage: StageEnum } = $props();
</script>

<div class="breadcrumbs">
    <div
        class="breadcrumb"
        class:active={activeStage > StageEnum.Project}
        class:selected={activeStage === StageEnum.Project}
    >
        <button onclick={() => activeStage = StageEnum.Project}>Project</button>
        <span class="chevron">›</span>
    </div>
    <div
        class="breadcrumb"
        class:active={activeStage > StageEnum.Import}
        class:selected={activeStage === StageEnum.Import}
    >
        <button onclick={() => activeStage = StageEnum.Import}>Import</button>
        <span class="chevron">›</span>
    </div>
    <div
        class="breadcrumb"
        class:active={activeStage > StageEnum.Drawing}
        class:selected={activeStage === StageEnum.Drawing}
    >
        <button onclick={() => activeStage = StageEnum.Drawing}>Drawing</button>
        <span class="chevron">›</span>
    </div>
    <div
        class="breadcrumb"
        class:active={activeStage > StageEnum.Planning}
        class:selected={activeStage === StageEnum.Planning}
    >
        <button onclick={() => activeStage = StageEnum.Planning}>Planning</button>
    </div>
    <div
        class="breadcrumb"
        class:active={activeStage > StageEnum.Programming}
        class:selected={activeStage === StageEnum.Programming}
    >
        <button onclick={() => activeStage = StageEnum.Programming}>Programming</button>
    </div>
</div>

<style>

    /**
     * Breadrcumbs
     */
     .breadcrumbs {
        display: flex;
        width: 100%;
        padding: 1rem;
        gap: 0.5rem;
        border-bottom: 2px solid #ccc;
    }

    .breadcrumb {
        display: flex;
        align-items: center;
        color: #666;
        font-size: 0.9rem;
        gap: 0.5rem;
    }

    .breadcrumb button {
        border: none;
        background: none;
        cursor: pointer;
    }

    .breadcrumb.active {
        color: #4caf50;
        font-weight: 500;
        border-bottom: 1px solid #4caf50;
    }

    .breadcrumb.selected {
        color: blue;
        font-weight: 500;
        border-bottom: 1px solid blue;
    }

    .chevron {
        color: #999;
        font-size: 1.2rem;
        line-height: 1;
    }
</style>