import { default as createUniqueString } from './ustring';
import { default as html } from './template/create';
import { default as css } from './template/css';
import { default as update } from './template/update';
import { default as bindFor } from './binders/bindfor';
import { default as bindForKeyed } from './binders/bindforkeyed';
import { default as memo } from './template/memo';
import { default as Store } from './template/store';
import { default as styled } from './template/styled';
import { createTemplateFromString } from './template/utils';
import { makeChildrenEqual, makeEqual } from './template/makeequal';
import * as types from './template/types';

export { default as createUniqueString } from './ustring';
export { default as html } from './template/create';
export { default as css } from './template/css';
export { default as update } from './template/update';
export { default as bindFor } from './binders/bindfor';
export { default as bindForKeyed } from './binders/bindforkeyed';
export { default as memo } from './template/memo';
export { default as Store } from './template/store';
export { default as styled } from './template/styled';
export { createTemplateFromString } from './template/utils';
export { makeChildrenEqual as makeEqualArray, makeEqual } from './template/makeequal';
export * from './template/types';

export default {
  createUniqueString,
  createTemplateFromString,
  makeChildrenEqual,
  html,
  css,
  update,
  bindFor,
  bindForKeyed,
  memo,
  Store,
  makeEqualArray: makeChildrenEqual,
  makeEqual,
  styled,
  ...types
};
