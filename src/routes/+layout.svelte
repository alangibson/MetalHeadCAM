<script lang="ts">
	let { children } = $props();
</script>

<style>
    .layout {
        display: grid;
        grid-template-rows: auto 1fr auto;
        min-height: 100vh;
        height: 100vh;
    }
    header {
        background: #f0f0f0;
        padding: 1rem;
    }
    footer {
        background: #f0f0f0;
        padding: 1rem;
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
    }
</style>

<div class="layout">
    <header>Header</header>
    {@render children()}
    <footer>
        Footer
    </footer>
</div>
