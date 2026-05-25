Respect the cascade layers `@layer base, ui, component, feature, composition, layout, utils;`
/* base:        resets, element defaults, design tokens
   ui:          design-system primitives (button, input)
   component:   simple components that compose ui components (input with label)
   feature:     feature-specific components
   composition: broad compositions (large modals, forms)
   layout:      page scaffolding, used exclusively under the `app` dir
   utils:       single-purpose overrides, very rare */

Layout affecting a component's outermost node (margin, position, offsets) is the parent's responsibility, not the component's. A component owns only its internal layout.

* Assume all node types have a reset already
* We use exclusively CSS Modules — styles are scoped per module, no global CSS.
* There's a suite of CSS Custom Properties for colors, sizes. See `src/app/_theme/variables.css`, `src/app/_theme/transitions.css`, and the glob of `src/app/_theme/colors/`
* Prefer modern CSS; container queries, relative colors, native CSS nesting, `& nesting selector`, but stick to Baseline Widely Available.
* Utilize selector segments like `:where`, `:not`, `:is`, `:has` to craft accurate selectors
* When possible, use CSS Custom Properties to modify values on interaction, f.e. `&:hover { --bgc: red; }`
* Simple grid and flex layouts should be deferred to the `<Grid />` and `<Flex />` React components
