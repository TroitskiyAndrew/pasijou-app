export function getElementHeight(selector: string): number {
  const element = document.querySelector(selector) as HTMLElement;
  return element.offsetHeight;
}




