process.env.NODE_ENV = 'production';
process.argv = [process.argv[0], process.argv[1], 'start', '-p', process.env.PORT || '3000'];
require('next/dist/bin/next');
