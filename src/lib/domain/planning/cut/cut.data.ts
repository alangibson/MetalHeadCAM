import type { PolyshapeData } from "$lib/geometry/polyshape/polyshape.data";
import type { LeadData } from "../lead/lead.data";
import type { RapidData } from "../rapid/rapid.data";

export interface CutData {
	rapidIn?: RapidData;
	leadIn?: LeadData;
	path: PolyshapeData;
	leadOut?: LeadData;
}