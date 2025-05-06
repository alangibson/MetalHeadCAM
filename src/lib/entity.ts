import { v4 as uuidv4 } from 'uuid';

export type Id = string;

/**
 * An Entity is a durable, mutable, long lived object.
 */
export abstract class Entity {
    // id is an opaque string.
    id = uuidv4();
}