import { makeComponentsLoader } from "@istok/mdx-render";

export function asyncComponents(componentsNames: string[]) {
  return makeComponentsLoader(componentsNames, (component) =>
    import("../components/load/" + component).then((m) => m.default)
  );
}
