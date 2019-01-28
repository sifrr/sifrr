module.exports = (name, ext) => {
  return `<template>
  <!-- Content -->
</template>
<script type="text/javascript">
  class ${name} extends Sifrr.Dom.Element${ext ? `.extends(${ext})` : ''} {
    onConnect() {

    }

    onDisconnect() {

    }
  }
  ${name}.defaultState = {};
  Sifrr.Dom.register(${name}${ext ? ', { extends: \'/* tag of html to extend, eg. tr */\' }' : ''});
</script>
`;
};
