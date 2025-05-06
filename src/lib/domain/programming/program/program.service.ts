import type { Plan } from "../../planning/plan/plan";
import { Program } from "./program";

export namespace Programming {
    
    export function validate(plan: Plan): boolean {

        // TODO add isSimple method to Part class
        // TODO If part is not simple (i.e. is self-intersecting) then
        //   throw an error. We can't safely cut self-intersecting parts.
        return true;
    }

    export function program(plan: Plan): Program {
        // TODO construct Program
        return new Program()
    }

}