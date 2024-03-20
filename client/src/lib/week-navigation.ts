import {Temporal} from '@js-temporal/polyfill';

export function next(current: Temporal.PlainDateTime): string {
  return current.add(new Temporal.Duration(0, 0, 1)).toString();
}

export function previous(current: Temporal.PlainDateTime): string {
  return current.add(new Temporal.Duration(0, 0, -1)).toString();
}
