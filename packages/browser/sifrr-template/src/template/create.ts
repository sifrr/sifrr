import { createTemplateFromString, functionMapCreator } from '../utils';
import { create, collect } from './ref';
import { TemplateProps } from './types';
import creator from './creator';
import update from './update';

const createTemplate = (str: TemplateStringsArray, ...substitutions: any[]) => {
  const { functionMap, mergedString } = functionMapCreator(str, substitutions);
  const template = createTemplateFromString(mergedString);
  const refMap = create(template.content, creator, functionMap);

  // cloning a document fragment, i.e. create instance of this template
  return (props?: TemplateProps) => {
    const temp = <HTMLTemplateElement>template.cloneNode(true);
    temp.refs = collect(temp.content, refMap);
    if (props) {
      temp.props = props;
      temp.props.__sifrrTemplate = temp;
    }
    update(temp);
    return temp;
  };
};

export default createTemplate;
