import { BrickElement } from "../shared/interfaces";

export function overrideProps(
  element: BrickElement,
  propertyName: string,
  value: any
): void {
  if (element) {
    element[propertyName] = value;
  }
}
