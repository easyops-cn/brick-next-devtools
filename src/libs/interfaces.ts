export interface BrickData {
  uid: number;
  tagName: string;
}

export interface RichBrickData extends BrickData {
  children: RichBrickData[];
}

export interface BricksByMountPoint {
  main?: RichBrickData[];
  bg?: RichBrickData[];
}

export interface BrickNode {
  $$brick: RuntimeBrick;
  children: BrickNode[];
}

export interface RuntimeBrick {
  element?: BrickElement;
}

export interface BrickElement extends HTMLElement {
  $$typeof?: "brick" | "custom-template";
}

export interface BrickElementConstructor extends Function {
  _dev_only_definedProperties: string[];
}

export interface MountPointElement extends HTMLElement {
  $$rootBricks?: BrickNode[];
}

export type BrowserTheme = "dark" | "light";
