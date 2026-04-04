import type { AbstractConstructor, Constructor, Mixin } from "@/mixins/types"

export function compose(
  base: AbstractConstructor<HTMLElement>,
  ...mixins: Array<Mixin<HTMLElement, any>>
): AbstractConstructor<HTMLElement>
export function compose(
  base: Constructor<HTMLElement>,
  ...mixins: Array<Mixin<HTMLElement, any>>
): Constructor<HTMLElement>
export function compose(...mixins: Array<Mixin<HTMLElement, any>>): Constructor<HTMLElement>
export function compose(
  baseOrMixin: AbstractConstructor<HTMLElement> | Constructor<HTMLElement> | Mixin<HTMLElement, any>,
  ...rest: Array<Mixin<HTMLElement, any>>
): AbstractConstructor<HTMLElement> | Constructor<HTMLElement> {
  const isBase = baseOrMixin === HTMLElement || baseOrMixin.prototype instanceof HTMLElement
  const base = isBase ? (baseOrMixin as Constructor<HTMLElement>) : HTMLElement
  const mixins = isBase ? rest : [baseOrMixin as Mixin<HTMLElement, any>, ...rest]
  return mixins.reduce((Base, mixin) => mixin(Base) as Constructor<HTMLElement>, base)
}
