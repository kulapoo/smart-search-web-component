// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Constructor<T = {}> = new (...args: any[]) => T

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AbstractConstructor<T = {}> = abstract new (...args: any[]) => T

/**
 * Class mixin: preserves the base constructor `T` and extends instances with `TAdded`.
 *
 * - `TBase` — minimum instance shape for the base (default `HTMLElement`). Narrow this for bases
 *   that are only typed for events or other structural members, e.g.
 *   `HTMLElement & { onsearch: ((e: CustomEvent) => void) | null }`.
 * - `TAdded` — properties/methods the mixin adds to `InstanceType<T>`.
 */
export type Mixin<TBase extends HTMLElement = HTMLElement, TAdded = {}> = <T extends Constructor<TBase>>(
  Base: T,
) => T & Constructor<InstanceType<T> & TAdded>
