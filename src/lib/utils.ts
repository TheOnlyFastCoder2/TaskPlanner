import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function* walkTree<T extends object, K extends keyof T>(tree: T, key: K) {
  const stack: T[] = [tree];
  while (stack.length > 0) {
    const current = stack.pop();
    if (current) {
      yield current;
      if (current && key in current && current[key]) {
        stack.push(current[key] as T);
      }
    }
  }
}

export function findDomElement(node: HTMLElement, idOrClass: string) {
  return Array.from(walkTree(node, 'parentElement')).find((item) => {
    return item.id == idOrClass || new RegExp(idOrClass).test(item.className);
  })
}
