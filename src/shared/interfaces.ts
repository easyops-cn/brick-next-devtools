export interface BrickData {
  uid: number;
  tagName?: string;
  includesInternalBricks?: boolean;
  invalid?: boolean;
}

export interface RichBrickData extends BrickData {
  children: RichBrickData[];
}

export interface BricksByMountPoint {
  main?: RichBrickData[];
  portal?: RichBrickData[];
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
  $$typeof?: "brick" | "provider" | "custom-template" | "native" | "invalid";
  // eslint-disable-next-line @typescript-eslint/ban-types
  $$eventListeners?: [string, Function, any?][];
}

export interface BrickElementConstructor extends Function {
  _dev_only_definedProperties: string[];
}

export interface MountPointElement extends HTMLElement {
  $$rootBricks?: BrickNode[];
}

export interface DehydratedBrickInfo {
  info: BrickInfo;
  repo: any[];
}

export interface BrickInfo {
  nativeProperties?: Record<string, any>;
  properties?: Record<string, any>;
  events?: [string, any][];
  tplState?: Record<string, any>;
}

export type BrowserTheme = "dark" | "light";

export interface EvaluationDetail {
  raw: string;
  context: Record<string, any>;
  result: any;
}

export interface Evaluation {
  id: number;
  detail: EvaluationDetail;
  error?: string;
}

export interface LazyEvaluation {
  id: number;
  hydrated: boolean;
  lowerRaw: string;
  payload?: unknown;
  repo?: unknown[];
  detail?: EvaluationDetail;
  error?: string;
}

export interface Transformation {
  id: number;
  detail: TransformationDetail;
  error?: string;
}

export interface TransformationDetail {
  transform: any;
  data: any;
  options: {
    from?: string | string[];
    mapArray?: boolean | "auto";
  };
  result: any;
}

export interface EmitData {
  type: string;
  payload?: any;
}

export interface DehydratedWrapper {
  $$brickNextDevtoolsDehydrated: Dehydrated;
}

export interface Dehydrated {
  type:
    | "object"
    | "function"
    | "symbol"
    | "ref"
    | "Infinity"
    | "-Infinity"
    | "NaN"
    | "undefined";
  constructorName?: string;
  ref?: number;
  children?: any;
}

export interface DehydratedPayload {
  type: string;
  payload: any;
  repo: any[];
}

export interface FrameData {
  frameId: number;
  frameURL: string;
}

export type PanelType =
  | "Bricks"
  | "Context"
  | "Evaluations"
  | "Transformations";
