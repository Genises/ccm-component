// Angelehnt an das Tutorial ccm Andre Kless
// https://github.com/akless/ccm-developer/wiki/Tutorial-2:-Chat-%231 Letzter Aufruf: 30.05.16

ccm.component( {
  name: 'comment_jmeier2s', //eigene für den Store
  config: {
    html:  [ ccm.store, { local: 'templates.json' } ],
    key:   'test',      //für den eigenen Chat
    store: [ ccm.store, { url: 'ws://ccm2.inf.h-brs.de/index.js', store: 'comment_jmeier2s' } ],
    style: [ ccm.load, 'ccm_kommentare.css' ],
    user:  [ ccm.instance, 'https://kaul.inf.h-brs.de/ccm/components/user2.js' ]
  },

  Instance: function () {
    var self = this; //auf instanz statt auf objekt
    self.init = function ( callback ) {
      self.store.onChange = function () { self.render(); };
      callback();
    };

    self.render = function ( callback ) {
      var element = ccm.helper.element( self ); //ersetzt Inhalte der seite mit eigenem ccm div
      self.store.get( self.key, function ( dataset ) {
        if ( dataset === null )
          self.store.set( { key: self.key, comments: [] }, proceed );
        else
          proceed( dataset );
        function proceed( dataset ) {
          element.html( ccm.helper.html( self.html.get( 'main' ) ) );
          var comments_div = ccm.helper.find( self, '.comments' );
          for ( var i = 0; i < dataset.comments.length; i++ ) {
            var comment = dataset.comments[ i ];
            comments_div.prepend( ccm.helper.html( self.html.get( 'comment' ), {
              name: ccm.helper.val( comment.user ),
              text: ccm.helper.val( comment.text )
            } ) );
          }

          comments_div.prepend( ccm.helper.html( self.html.get( 'input' ), { onsubmit: function () {
            var value = ccm.helper.val( ccm.helper.find( self, 'input' ).val() ).trim();
            if ( value === '' ) return;
            self.user.login( function () {
              dataset.comments.push( { user: self.user.data().key, text: value } );
              self.store.set( dataset, function () { self.render(); } );
            } );
            return false;
          } } ) );
          if ( callback ) callback();
        }
      } );
    };
  }
} );