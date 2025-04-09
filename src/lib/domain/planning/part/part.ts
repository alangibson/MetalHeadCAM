import type { Cut } from "../cut/cut";

export class Part {
    shell: Cut;
	holes: Cut[] = [];

    constructor({ shell, holes }: Part) {
		this.shell = shell;
		this.holes = holes;
	}

	get cuts(): Cut[] {
		return [this.shell, ...this.holes];
	}
}