module.exports = (name, ext) => {
  return `<template use-shadow-root="true">
  <!-- Content -->
</template>
<script type="text/javascript">
  class ${name} extends Sifrr.Dom.Element${ext} {
    onConnect() {

    }

    onDisconnect() {

    }
  }
  ${name}.defaultState = {};
  Sifrr.Dom.register(${name});
</script>
`;
};
