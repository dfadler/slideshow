define(function() {

    describe("Foo Model", function() {
      it('should not equal bar', function () {
          expect('foo').to.not.equal('bar');
      });
    });

    describe("Bar Model", function() {
      it('should equal bar', function () {
          expect('bar').to.equal('bar');
      });
    });

});