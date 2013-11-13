rm -rf dist
cp -R app/ dist/
jam compile -o dist/scripts/vendor/require.js
rm -rf dist/tests
rm -rf dist/testRunner.html