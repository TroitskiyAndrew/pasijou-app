export function getElementHeight(selector: string): number {
  const element = document.querySelector(selector) as HTMLElement;
  return element.offsetHeight;
}

export function getCurrentDate(): string {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
}


