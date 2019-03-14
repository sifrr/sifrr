require('./server')(1111);
require('./benchmarks/express').listen(4444, global.console.log);
require('./benchmarks/sifrr').listen(4445, global.console.log);
