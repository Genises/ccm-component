// Angelehnt an das Tutorial ccm Andre Kless
// https://github.com/akless/ccm-developer/wiki/Tutorial-2:-Chat-%231 Letzter Aufruf: 30.05.16

ccm.component({
    name: 'comment_jmeier2s', //eigene für den Store
    config: {
        html: [ccm.store, {local: 'templates.json'}],
        key: 'test',      //für den eigenen Chat
        store: [ccm.store, {url: 'ws://ccm2.inf.h-brs.de/index.js', store: 'comment_jmeier2s'}],
        style: [ccm.load, 'ccm_kommentare.css'],
        user: [ccm.instance, 'https://kaul.inf.h-brs.de/ccm/components/user2.js']
    },

    Instance: function () {
        var self = this; //auf instanz statt auf objekt
        self.init = function (callback) {
            self.store.onChange = function () {
                self.render();
            };
            callback();
        };

        self.render = function (callback) {
            var element = ccm.helper.element(self); //ersetzt Inhalte der seite mit eigenem ccm div
            self.store.get(self.key, function (dataset) {
                if (dataset === null)
                    self.store.set({key: self.key, comments: []}, proceed);
                else
                    proceed(dataset);

                function convertDate(date){
                    var actualTime = new Date();
                    var dif = new Date (actualTime - date);
                    if(dif.getTime() < 1000*60){
                        return "Eingereicht vor " + dif.getSeconds() + " Sekunden von: ";
                    }
                    if(dif.getTime() < 1000*60*60){
                        return "Eingereicht vor " + dif.getMinutes() + " Minuten von ";
                    }
                    if(dif.getTime() < 1000*60*60*24){
                        return "Eingereicht vor " + dif.getHours() + " Stunden von ";
                    } else {
                        return "Eingereicht vor " + parseInt(dif.getTime()/1000*60*60*24) + " Tagen von ";
                    }
                }

                function proceed(dataset) {
                    element.html(ccm.helper.html(self.html.get('main')));
                    var comments_div = ccm.helper.find(self, '.comments');

                    dataset.comments.sort(function (a, b) {
                        return b.likevalue - a.likevalue
                    });

                    for (var i = 0; i < dataset.comments.length; i++) {
                        var comment = dataset.comments[i];
                        (function (comment) {
                            comments_div.append(ccm.helper.html(self.html.get('comment'), {
                                date: ccm.helper.val(convertDate(new Date(comment.date))),
                                name: ccm.helper.val(comment.user),
                                text: ccm.helper.val(comment.text),
                                likevalue: ccm.helper.val(comment.likevalue),
                                likeclick: function () {
                                    comment.likevalue = parseInt(comment.likevalue) + 1 ;
                                    console.log(comment);
                                    self.store.set(dataset, function () {
                                        self.render();
                                    });
                                },
                                dislikeclick: function () {
                                    comment.likevalue = parseInt(comment.likevalue) - 1 ;
                                    console.log(comment);
                                    self.store.set(dataset, function () {
                                        self.render();
                                    });
                                }
                            }));

                        })(comment);
                    }

                    comments_div.prepend(ccm.helper.html(self.html.get('input'), {
                        totalcomments: dataset.comments.length,
                        onsubmit: function () {
                            var value = ccm.helper.val(ccm.helper.find(self, 'input').val()).trim();
                            if (value === '') return;
                            var time;

                            self.user.login(function () {
                                        dataset.comments.push({
                                            user: self.user.data().key,
                                            text: value,
                                            date: new Date(),
                                            likevalue: '0'
                                        });
                                        // update dataset for rendering in datastore
                                        self.store.set(dataset, function () {
                                            self.render();
                                        });
                            });
                            return false;
                        }
                    }));




                    if (callback) callback();
                }
            });
        };
    }
});
