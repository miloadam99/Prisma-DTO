export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Remove a section of text based on a starting and ending string
export function removeSection(
  text: string,
  start: string,
  end: string
): string {
  let startIndex = text.indexOf(start);
  if (startIndex === -1) {
    return text;
  }

  let endIndex = text.indexOf(end, startIndex);
  if (endIndex === -1) {
    throw new Error("Couldn't find ending for schema section");
  }

  return text.slice(0, startIndex) + text.slice(endIndex + end.length);
}

export interface ParsedModel {
  model: any;
  name: string;
  fields: string[];
}

export function parseModel(model: Function): ParsedModel {
  return {
    model,
    name: Reflect.getMetadata("model:name", model) || model.name,
    fields: Reflect.getMetadata("model:fields", model),
  };
}

export function getEnumName(model: ParsedModel, fieldKey: string) {
  return `${capitalize(model.name)}${capitalize(fieldKey)}Enum`;
}

export type Class = (...args: any[]) => any;
