export function getElementHeight(selector: string): number{
  const element = document.querySelector(selector) as HTMLElement;
  return element.offsetHeight;
}

export function setPaddingTop(selector: string) {
  const paddingHolders = document.querySelectorAll('.padding-holder') as NodeListOf<HTMLElement>;
  paddingHolders.forEach(elem => elem.style.paddingTop = "0px")
  const target = document.querySelector(selector) as HTMLElement;
  const headerHeight = getElementHeight('app-header');
  target.style.paddingTop = `${headerHeight}px`;
}
