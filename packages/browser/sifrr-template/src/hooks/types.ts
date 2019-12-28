import { BindingFxn } from '../template/types';

export type Hook<T> = (...a: any[]) => BindingFxn<T>;

export default {};
