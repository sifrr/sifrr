import { SifrrKeyType } from '@/template/types';

const temp = document.createElement('template');
const comment = document.createComment('Sifrr');

// binding string
export const BIND_REF_LENGTH = 8;
export const PREFIX = 'STB_';
// const REF = `{{${PREFIX}(.{${BIND_REF_LENGTH}})}}`;
const REF = `{{(?:${PREFIX})?([^}]+)}}`;
export const REF_REG = new RegExp(REF);
export const REF_REG_GLOBAL = new RegExp(REF, 'g');
export const REF_REG_EXACT = new RegExp('^' + REF + '$');
export const CommentKeySymbol = Symbol('comment-key');

// dom elements
export const TEMPLATE = () => <HTMLTemplateElement>temp.cloneNode(false);
export const TREE_WALKER = (root: Node) =>
  document.createTreeWalker(root, NodeFilter.SHOW_ALL, null);
export const REFERENCE_COMMENT = (key?: boolean) => {
  const node = comment.cloneNode(true) as Comment;
  if (key) (node as any).key = CommentKeySymbol;
  return node as Comment & { key: SifrrKeyType; [x: string]: unknown };
};
export const SIFRR_FRAGMENT = () => document.createElement('sifrr-fragment');

// node types
export const TEXT_NODE = Node.TEXT_NODE;
export const COMMENT_NODE = Node.COMMENT_NODE;
export const ELEMENT_NODE = Node.ELEMENT_NODE;
