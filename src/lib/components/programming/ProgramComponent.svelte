<script lang="ts">
    import { Programming } from "$lib/domain/programming/program/program.service";

    let { plan } = $props();

    // TODO make sure we can program this plan
    Programming.validate(plan);

    let program: Program = Programming.program(plan);

</script>

<button>
    Refresh
</button>

<textarea>
    TODO gcode
</textarea>
