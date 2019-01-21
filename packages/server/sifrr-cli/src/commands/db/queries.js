module.exports = {
  reset: (dbName) => `DROP DATABASE IF EXISTS ${dbName}; CREATE DATABASE ${dbName};`,
  setup: (dbName) => `CREATE DATABASE IF NOT EXISTS ${dbName};`
};
