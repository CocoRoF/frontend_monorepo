export interface NodeInput {
  id: string;
  name: string;
  type: string;
  multi: boolean;
  required: boolean;
  value?: unknown;
}

export interface NodeOutput {
  id: string;
  name: string;
  type: string;
  required: boolean;
  multi: boolean;
  stream: boolean;
}

export interface NodeParameter {
  id: string;
  name: string;
  type: string;
  value?: unknown;
  required: boolean;
  optional?: boolean;
  description?: string;
  min?: number;
  max?: number;
  step?: number;
  expandable?: boolean;
}

export interface Node {
  functionId: string;
  id: string;
  nodeName: string;
  description: string;
  tags: string[];
  inputs: NodeInput[];
  outputs: NodeOutput[];
  parameters: NodeParameter[];
  disable?: boolean;
}

export interface NodeFunction {
  functionId: string;
  functionName: string;
  nodes: Node[];
}

export interface NodeCategory {
  categoryId: string;
  categoryName: string;
  icon: string;
  functions: NodeFunction[];
}

// Flat node for table view
export type FlatNode = Node & {
  categoryId: string;
  categoryName: string;
  functionId: string;
  functionName: string;
};
