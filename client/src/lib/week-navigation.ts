import {Temporal} from '@js-temporal/polyfill';

export function next(current: Temporal.ZonedDateTime): string {
  return current.add({weeks: 1}).toInstant().toString();
}

export function previous(current: Temporal.ZonedDateTime): string {
  return current.add({weeks: -1}).toInstant().toString();
}
