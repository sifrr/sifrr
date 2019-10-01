const {
  GraphQLNonNull,
  GraphQLList,
  GraphQLObjectType,
  GraphQLUnionType,
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLInterfaceType
} = require('graphql');

const ArgumentType = require('./graphql/types/argument');
const FieldType = require('./graphql/types/field');

const ObjectType = require('./graphql/types/objects/objecttype');
const UnionType = require('./graphql/types/objects/uniontype');
const EnumType = require('./graphql/types/objects/enumtype');
const InputType = require('./graphql/types/objects/inputtype');
const InterfaceType = require('./graphql/types/objects/interfacetype');

const { objectToMap } = require('./graphql/util');

function graphqlTypeToString(graphqlObject) {
  if (!graphqlObject) return null;
  if (Array.isArray(graphqlObject)) return graphqlObject.map(g => graphqlTypeToString(g));

  let nullable = true;
  let list = false;

  if (graphqlObject instanceof GraphQLNonNull) {
    nullable = true;
    graphqlObject = graphqlObject.ofType;
  }

  if (graphqlObject instanceof GraphQLList) {
    list = true;
    graphqlObject = graphqlObject.ofType;
  }

  const type = graphqlObject.name;
  return `${list ? `[${type}]` : type}${nullable ? '' : '!'}`;
}

function graphqlObjectToType(graphqlObject, isArgument = false) {
  if (Array.isArray(graphqlObject)) return graphqlObject.map(g => graphqlObjectToType(g));

  if (graphqlObject instanceof GraphQLInterfaceType) {
    return InterfaceType.from({
      name: graphqlObject.name,
      fields: graphqlObjectToType(graphqlObject.fields),
      description: graphqlObject.description,
      resolveType: graphqlObject.resolveType
        ? graphqlObject.resolveType.bind(graphqlObject)
        : undefined
    });
  }

  if (graphqlObject instanceof GraphQLEnumType) {
    return EnumType.from({
      name: graphqlObject.name,
      values: graphqlObjectToType(graphqlObject.values),
      description: graphqlObject.description
    });
  }

  if (graphqlObject instanceof GraphQLUnionType) {
    return UnionType.from({
      name: graphqlObject.name,
      types: graphqlObjectToType(graphqlObject.types),
      description: graphqlObject.description,
      resolveType: graphqlObject.resolveType
        ? graphqlObject.resolveType.bind(graphqlObject)
        : undefined
    });
  }

  if (graphqlObject instanceof GraphQLInputObjectType) {
    return InputType.from({
      name: graphqlObject.name,
      fields: graphqlObjectToType(graphqlObject.fields),
      description: graphqlObject.description
    });
  }

  if (graphqlObject instanceof GraphQLObjectType) {
    return ObjectType.from({
      name: graphqlObject.name,
      interfaces: graphqlObjectToType(graphqlObject.interfaces),
      fields: graphqlObjectToType(graphqlObject.fields),
      description: graphqlObject.description
    });
  }

  if (typeof graphqlObject === 'object') {
    const all = {};
    Object.keys(graphqlObject).map(f => {
      const gqObject = graphqlObject[f];
      let args = {};

      if (gqObject.args) {
        args = Object.keys(gqObject.args).forEach(
          g =>
            (args[g] = ArgumentType.from({
              name: g,
              type: graphqlTypeToString(gqObject.args[g].type),
              defaultValue: gqObject.args[g].defaultValue,
              description: gqObject.args[g].description,
              deprecated: false
            }))
        );
      }

      const Construct = isArgument ? ArgumentType : FieldType;

      all[f] = Construct.from({
        name: f,
        args,
        type: graphqlTypeToString(gqObject.type),
        resolver: gqObject.resolve
      });
    });
    return objectToMap(all);
  }

  return null;
}

module.exports = { graphqlTypeToString, graphqlObjectToType };
