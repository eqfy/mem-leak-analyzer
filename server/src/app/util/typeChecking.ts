export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value);
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

export function isString(value: unknown): value is string {
  return typeof value === 'string' || value instanceof String;
}

export function isObject(object: unknown): object is object {
  return typeof object === 'object' && !Array.isArray(object) && object !== null;
}
