/**
 * Copyright 2016 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// This generated service worker JavaScript will precache your site's resources.
// The code needs to be saved in a .js file at the top-level of your site, and registered
// from your pages in order to be used. See
// https://github.com/googlechrome/sw-precache/blob/master/demo/app/js/service-worker-registration.js
// for an example of how you can register this script and handle various service worker events.

/* eslint-env worker, serviceworker */
/* eslint-disable indent, no-unused-vars, no-multiple-empty-lines, max-nested-callbacks, space-before-function-paren */
'use strict';





/* eslint-disable quotes, comma-spacing */
var PrecacheConfig = [["/bower_components/webcomponentsjs/webcomponents-lite.min.js","f04ed23700daeb36f637bfe095960659"],["/data/blog.json","8ab17248b5050bffb5cd3c2886411a70"],["/data/cs/resources.json","8f06e9c1c0056b71e11e81e6bc9ba943"],["/data/en/resources.json","c9ca7ae20cecb2d22883a3f24b5da028"],["/data/hotels.json","0d1f35d3a6cf0e39a9c05f5caa70301f"],["/data/hoverboard.config.json","d6d76b11cd612bfc615f378337395df6"],["/data/partners.json","06644ff03b054fb5fbdd5fcc998f04b5"],["/data/posts/2016-09-05-devfest-2016-announced.markdown","0d3ae19024694b21ee6c0bee5caff8b0"],["/data/posts/2016-09-25-first-speakers-and-cfp.markdown","95d73fc203971330cd596176413ffa67"],["/data/posts/2016-10-10-free-tickets-contest.markdown","bfcedad6ccdacc98519526516dc153e9"],["/data/posts/2016-10-13-meet-our-platinum-partner.markdown","d7bf3d5cf6000ad63a0e774a2f8cb796"],["/data/posts/2016-10-25-our-gold-partner-avast-and-wifisnitcher.markdown","2ecbfc06f4f366eff0d1c76b7d423130"],["/data/posts/2016-10-26-our-gift-partner-jetbrains.markdown","885e8f9efe970b83eb8339f78dc5b90c"],["/data/posts/2016-10-31-our-gold-partner-fnx-io.markdown","8f9d068a5d635f16dca755295cc6fd7e"],["/data/posts/2016-11-02-our-gold-partner-eman.markdown","e51b3fac4bfbdb2f12a4c436cad60491"],["/data/posts/2016-11-03-our-diamond-partner-eurosoftware.markdown","cb591916c1a208031b66dafbaa8dc3fc"],["/data/posts/2016-11-09-thanks-to-our-gift-partner-asus.markdown","7bb1f04b026e12302b981df664943868"],["/data/posts/code-of-conduct.markdown","f2de014555c9c49c0b0156a0fb3b1440"],["/data/schedule.json","58dc63171eb090926860686d9a1bcb51"],["/data/sessions.json","053949b27d9e8fa137cb01c83dad6ff1"],["/data/speakers.json","4e408a8c24fb188267dd54ff59c2c150"],["/data/team.json","41a015243c54ba9ed473850cdc3d47d5"],["/data/team_hidden.json","f496f2f5dcad99552d1ba52115aa2cf5"],["/data/tweets.json","58e0494c51d30eb3494f7c9198986bb9"],["/data/videos.json","c247605c340da90ab936c94e59fde7c8"],["/images/backgrounds/2015_1.jpg","d71242baaca809e1d49ebe3eaab074e3"],["/images/backgrounds/2015_2.jpg","5745329d120192cd9a9fbad1eb1765b8"],["/images/backgrounds/2015_3.jpg","67ea316f2de1915660be3cbd8d689aab"],["/images/backgrounds/2016_1.jpg","55f15a389feb31d1495fa1b5501c81a6"],["/images/backgrounds/2016_2.jpg","c4b578fd87fe4cd772a21e96e94de614"],["/images/backgrounds/2016_3.jpg","afefb1e8e8baa9ea4a58ead5ad1358e3"],["/images/backgrounds/home.png","0b0ac45e54de452066013bafdc69eaff"],["/images/backgrounds/location_1.jpg","d5cfa0bdd85c8e25291f8308b0bf28c3"],["/images/backgrounds/location_2.jpg","d4b197ea614f3b71c516c4985672ad59"],["/images/backgrounds/location_3.jpg","0b4762afe6ba520a2651fdd56aeeca7a"],["/images/favicon/favicon-32.png","a9509ca258731e12d52dd223ad1ba4c8"],["/images/favicon/favicon-72.png","8a50435f9af90132f255eb24018c68dc"],["/images/favicon/favicon.ico","b86585686052335d3f7ef73973e18aef"],["/images/gdg-logo.svg","cd1872bedfdd9e4a7d15f0a719960420"],["/images/logo-light.svg","603b409c8924ddd84acdd45131b53dcd"],["/images/logo-white.svg","49096f446ce94d3f257872d7338cda14"],["/images/logo.svg","e49384028a14ce0973f0c3fa2379e8bd"],["/images/logos/aimtec.gif","f4f6b7799f8407081fa2c1bed265bf73"],["/images/logos/aimtec.png","e7af94da4e066392f7fdac0260eca472"],["/images/logos/alza_cz.png","5572aeeb82170aab1c719560543057e9"],["/images/logos/angular-cz.svg","e224f5ed261735072b00bdb3bae20cbd"],["/images/logos/appsatori.png","ea3bb21b0ab6b2b6599cd9b8e0c7dcf0"],["/images/logos/asus.svg","b011dd49aab2e264a5ab64cb34570fec"],["/images/logos/avast.svg","17031654aab76e6543a538cbafca04ec"],["/images/logos/bigclown.png","6f40c91658a8b208341b16c842ee4e67"],["/images/logos/dotekomanie.png","f0a4d8e979141f4d5d3cf8afdaf56261"],["/images/logos/droidik.png","af697d2e24a7422ba0618c008bffe400"],["/images/logos/eman.png","0ce13f8ae5c75066a99f46d01f42e2d9"],["/images/logos/eurosoftware.svg","d0d6c300c7e80413002687ca7d612bce"],["/images/logos/eventigo.png","af7b1925cfda3f3caa3df60a4abb6368"],["/images/logos/fnxio.svg","eb147bb569d0bcd47abec0abf2855357"],["/images/logos/gdg-pilsen.svg","07136c8ebadccfeffbcb2ed1c4ac8076"],["/images/logos/gdg-x.svg","f8fb99f2d34c78761130651f9d46c5ed"],["/images/logos/geneea.png","1a1ad7499aab33deeebe763ad9683ead"],["/images/logos/google.svg","73a549b042f167745e0eb3061c12009f"],["/images/logos/gug-cz.svg","30c9190a7742dd31585577f7abbb3058"],["/images/logos/innovation_box.png","4a0ad7175b468dd49a71e7ad7c7e0c52"],["/images/logos/jetbrains.svg","15506968ebe47ad924203fad378ea2a0"],["/images/logos/justanswer.com.png","8ea029c9ae605437dd9383d3bed9ce86"],["/images/logos/keboola.png","73e1af1d4da7a9cc0781b8323adf7dfb"],["/images/logos/kiwi.png","316bdd6b30da5c7904beb43daad0309b"],["/images/logos/n-ix.svg","c9d02020a0dad3625507d89988f0eddb"],["/images/logos/netmail.svg","1eab832e899e3de48a95c66c8dd40408"],["/images/logos/ovax.png","3aebf234617d75755475c6d07fea5f48"],["/images/logos/seznam.png","33c728bd0de52eb46b49562a01ba7f76"],["/images/logos/stepuplabs.png","a26ab1c076b0467345801eb95295ba00"],["/images/logos/stepuplabs.svg","39ad7741a6b2c26ef39b8306c41eaa67"],["/images/logos/tango_software.png","a4e09c6a43ae05d2e95533fc70073625"],["/images/logos/topmonks.svg","9c976b80073702f31d4e00ec314e70e0"],["/images/logos/tyinternety.svg","8d598f78aa71d551077ccde5277b8acf"],["/images/logos/zajic_na_pivu.png","8c647ad0b78305bd36c9e36cf37e7d5f"],["/images/logos/zoot.png","3cc9ea3a2679636a02dd09372acf2133"],["/images/people/Jan Šmucr.jpg","fa2392d203b3fa6915a48eb1063b26bd"],["/images/people/alan_fabik.png","8d0eac791b61344d1eb2fd03e2df61b7"],["/images/people/anna_senk.jpg","1083109345dd7c87c1a2c1a1f44514cc"],["/images/people/dana_lew.jpg","dbe6097c969a1c422c7c2f29c8d38ba0"],["/images/people/danny_macho.jpg","c42996260bda44d78a03c2960676e005"],["/images/people/david_kovac.jpg","67c04ad011e64f526d6866c9e01c2988"],["/images/people/david_moravek.jpg","e4ce6a797772e58b7bbf7715233da156"],["/images/people/david_vavra.jpg","36b36fbfd39cf79811b709a59b584c69"],["/images/people/eva_neuhoferova.jpg","9a846d4260f594e83a4d75d93c09cb0b"],["/images/people/filip_goszler.jpg","5bdcc9f65e8a1edea75f5314c960bd16"],["/images/people/filip_prochazka.jpg","13f35a8b275c3c8335eed9db2f989fc7"],["/images/people/honza_slavik.jpg","a61b90a65e44ad6f6402e651b5e830aa"],["/images/people/honza_steinbach.jpg","d89d10225eb4c769eef92926c4be52fb"],["/images/people/hubert_svab.jpg","45a538317e471ca3f25626898b635002"],["/images/people/ivan_kutil.jpg","71d7bbd776d21011a987dfb638fa7790"],["/images/people/jakub_boucek.jpg","e2949af091b1548a50d5fb8142d8e4d8"],["/images/people/jakub_kotasek.jpg","3d01314f1df9399ba2bc1f477990a4e2"],["/images/people/jakub_zika.jpg","3d25bb97d843faa0d27fb9a706c285be"],["/images/people/jakub_škvára.jpg","91d772c2d43a89ebf9ff2db6f9d7da09"],["/images/people/jan_brnka.jpg","af24a5c75d7259d23071841aad0b2943"],["/images/people/jan_smucr.jpg","fa2392d203b3fa6915a48eb1063b26bd"],["/images/people/jana_moudra.jpg","599274aedd2628e4cca8f25a06de9c42"],["/images/people/jaroslav_holan.jpg","0c699ed9e9437c701bdde49bc37c1d1e"],["/images/people/jiri_loudil.jpg","487d19e1856b6bfeb7248bfc7b900e41"],["/images/people/jozef_vodicka.jpg","a637531e56379d8fd17e193ad41feac2"],["/images/people/juraj_oceliak.jpg","b672b6481ae327defd076001dea644b8"],["/images/people/karel_zizka.jpg","7e49ddc42aebd55d7436f0717d734191"],["/images/people/katerina_pejskova.jpg","0e40992280c4d290385ff0af06189dcb"],["/images/people/konrad_dzwinel.jpg","87fa8ec3b0c03fbf1ec7fbb76f095001"],["/images/people/leon_freiberg.jpg","6cdc3cdb91b78407093fb7a0faa1a1e1"],["/images/people/lukas_vaculik.jpg","216f49093732c2daaecca98e88e96dba"],["/images/people/marcel_laza.jpg","eb384e05f061529bca3fa6e3f24a1c4e"],["/images/people/martin_cacky.jpg","8cd657b3a8398899e2249a455f8465e7"],["/images/people/matej_horak.jpg","7eca4414f8597c4a951c1fd4f53f5e3e"],["/images/people/matus_kacmar.png","7096b834ad68d3a4c410b7e9e74053ef"],["/images/people/mete_atamel.jpg","39f2efedeb5a1c81abdabf7e0d13d8de"],["/images/people/michal_havryluk.jpg","f7b3753e73b837f129615d0b835aede2"],["/images/people/michala_strazovska.jpg","bc1c5e538f5dba07743207c424d55e6b"],["/images/people/milan_lempera.jpg","f35532b55c64f55ff77984f8d0ae83f7"],["/images/people/miro_kosik.jpg","8d6520f017a1de2de3fbbd8709a59aff"],["/images/people/oleh_zasadnyy.jpg","6f197bc92b41cbfa37fbe2d1c8ed86af"],["/images/people/ondrej_vesely.jpg","789c2006ba689b13c861b824ebcdd56c"],["/images/people/pavel_hubner.png","c2b5987ff03643f38b8e728d5d1f0ca9"],["/images/people/petr_fershmann.jpg","9c0b491afafb20a5fea3ebac4ff5c967"],["/images/people/petr_hamernik.jpg","00ce94cef3d57a470ee2054be3605ac9"],["/images/people/renata_mechurova.jpg","3faa59063f697de02e191387f1ecd9bb"],["/images/people/resul_caner_yildirim.jpg","b2a83006e7af2bb817277425d74e28de"],["/images/people/roman_krnoul.jpg","8cc03544b49005001f0f3878054cbf72"],["/images/people/silvana_wasitova.jpg","d87f3beb290dafb5bba56d1ae0ebc0b0"],["/images/people/sofia_huts.jpg","223b4fa3e844a8aee0c8730c864f93c6"],["/images/people/stanislav_horacek.jpg","9447f17465fe349bbaed37d426fa6dc0"],["/images/people/svetlana_margetova.jpg","d45cf53e2626acee7e32c9b46ae552cf"],["/images/people/tomas_casta.jpg","a0ccbeead5e948349192ea043a5d874f"],["/images/people/tomas_jukin.jpg","e927aa1ef7e32f770822f28e75be410a"],["/images/people/tomas_kypta.jpg","77fa7efb1bc12e4b2edf05d721a7ef2a"],["/images/people/tomas_rampa.jpg","6b1430999cee36de503156413d2dac6a"],["/images/people/tomas_zverina.jpg","df35afc5fea3a6167dbf919413f21ca7"],["/images/people/vit_listik.jpg","4b645ab38f5247264118c7ff282b5a21"],["/images/people/vlastimil_kramel.jpg","e5e9887344e6f4b180cf6580dd4f6473"],["/images/posts/aimtec_partner_1.jpg","163bd6d2dcd292151fe5155b02843de4"],["/images/posts/aimtec_partner_2.jpg","16d3d16e2df85f18c723512f39f73429"],["/images/posts/announce.jpg","7371309930620dfd29734ac83edccd9c"],["/images/posts/announce.png","0b0ac45e54de452066013bafdc69eaff"],["/images/posts/asus_partner.png","b142646d9cc920ba95200a75ad8382e8"],["/images/posts/avast_wifisnitcher.jpg","17d0d3e6a7075884916a8147cbfd82a6"],["/images/posts/eman_partner.jpg","f7e096946112cf9a8cbf6ec89c90f1e7"],["/images/posts/eman_partner.png","2972c1cfdcf2d0e7103044bfc3b8af1e"],["/images/posts/eurosoftware_partner.jpg","df5c26dbd42acce003ca9e6ba2b4e6a9"],["/images/posts/eurosoftware_partner_2.jpg","5fb957423a4a23ffe1be7cd4e1af1f56"],["/images/posts/fnxio_partner.jpg","88f154457f2db4ee5d2e39231112f918"],["/images/posts/free_tickets_contest.png","9e9db0d1ce406f101b842eb4d3977410"],["/images/posts/jetbrains_partner.jpg","ef7cbb3a49ff9f49e2f25738ac3aa841"],["/images/posts/speakers_announced.jpg","9e19c75f290fe2ab4a78c2926292fc2b"],["/images/sessions/afterparty.jpg","55a20fb2a8e84929b1a08dff37ff77ee"],["/images/sessions/barcamp.jpg","d6f354217cca00ae4e9e3ae0856680d3"],["/images/sessions/breakfast.jpg","87cbbe3795bf502e7d51101ac43185a4"],["/images/sessions/dinner.jpg","01c8cd088a9b49fbdb2c452780d2c0fb"],["/images/sessions/doors_closed.jpg","63ff3eb5244ca34b79021ff4e4f39e9c"],["/images/sessions/lunch.jpg","19e09d6fdd82d9c140d55ba05c14eedf"],["/images/sessions/past_1.jpg","1349e85c7de623720291cfab6d030cd4"],["/images/sessions/past_2.jpg","a1bda0e80ec4695c3ba428302be4907b"],["/images/sessions/past_3.jpg","4f2b973d6251dbda9bef358ecfebcca8"],["/images/sessions/past_4.jpg","75474586738566bf847858379ef5793f"],["/images/sessions/past_5.jpg","8a6b74a86ed7db35fa30c88d4258851e"],["/images/sessions/past_6.jpg","2cc9b0b54117cb6955c17ceab4cd7868"],["/images/sessions/past_7.jpg","949a9815a3b89a7f27a082ad12bf2ac1"],["/images/social-share.jpg","546e13081b2d268d276cdb245b484b23"],["/images/social-share.png","d644fc86ecf5b3f0618ce8c3c2ddca3c"],["/images/stuff/android_logo.png","c13839b999134d4c64799ead47d59508"],["/images/stuff/angular.svg","1c0c349ad9921e0675e6d7a2920d4c72"],["/images/stuff/astory_hotel.jpg","f37747f1748b98007f21a1fdc02af958"],["/images/stuff/dart_lang.png","68ea4fcf8c707d5b4bad9fb16096617e"],["/images/stuff/drones_logo.png","653357c16123df58a904c1b99ed94c60"],["/images/stuff/gcp_logo.png","389ef7f4f55209504455403876c7cbb2"],["/images/stuff/graph_ql.png","a2ee0442b68e7d9d526a54efb55f3ae8"],["/images/stuff/innovation.png","46f09c5fe23ab8f0415028530caa7b07"],["/images/stuff/iot_openhw.png","575012cd80f0c1d1f60a6145544ca4d1"],["/images/stuff/machine_learning.png","98d0a59d81fe05e7c5421d2099d7ecea"],["/images/stuff/penzion_u_zimaku.jpg","cac096bbe9d4888c55793efca0c631c3"],["/images/stuff/polymer-logo.png","dc8cf3b5427b132d18e55333acfbcfc5"],["/images/stuff/primavera_hotel.jpg","0162e2a2ecabe5d3e42a0270d8120227"],["/images/touch/homescreen-144.png","777fba2c9ab035808a6925ca611bc67f"],["/images/touch/homescreen-168.png","fc1f8e5f1a213ad6c2731c089fef3de1"],["/images/touch/homescreen-192.png","1775ae0aca4e1db5d5b1650a3b2c7eac"],["/images/touch/homescreen-256.png","c30a7a4972a7b4a5c0ad7c9572cb3e87"],["/images/touch/homescreen-48.png","0a740b7afb3040a80eb0622ee24b35ac"],["/images/touch/homescreen-72.png","8a50435f9af90132f255eb24018c68dc"],["/images/touch/homescreen-96.png","0f6e04240af1efb86d43d278564d46ac"],["/index.html","892df0e53689ad48b1e3a7fd909a7ef9"],["/manifest.json","c38ad1c0d7a0b512fd017f6b4f470613"],["/scripts/bootstrap.js","39e9af045cbc4f2a1efa292c28fc6fe2"],["/scripts/helper/deferred.js","00ad32e38a07f247290c2f67e536d711"],["/scripts/helper/elements.js","0ca8fba3ee9ce7cba1d836a0bed8afea"],["/scripts/helper/promise-polyfill.js","bce372630e22345ff83479f41c533046"],["/scripts/helper/service-worker-registration.js","262e0fa9da433c148524e8fe4d1149dd"],["/scripts/helper/util.js","36c5192324d40e060799d58a38f96ef6"],["/scripts/metrics.js","8623bff01545e628beb021b08b8afa31"],["/src/behaviors/cascaded-behavior.html","730852d4e5815517a98f15788ba2c56c"],["/src/behaviors/localize-behavior.html","5c9051994ed4cb58f9ca0a2cfbf0c483"],["/src/behaviors/my-schedule-behavior.html","209876e3e8e5165c4158d61afb4fe7c7"],["/src/behaviors/page-behavior.html","7a14e88bebe781a58ef61c15252a8e4d"],["/src/behaviors/share-behavior.html","cb664197f584d8b10b94d069c119214c"],["/src/behaviors/utils-behavior.html","2c97d453283e93d3fa4449a6c93ab5e6"],["/src/effects/fade-effect.html","8ee4b618e5e00c5b2c822a7bdddfa1b1"],["/src/elements/about-block.html","bed1462f08b432d21111284783e15353"],["/src/elements/accomodation-block.html","146a81330834a464d97ce212a609f2d9"],["/src/elements/animatable-content.html","f4b07f855a4880b041ad91499007f74f"],["/src/elements/app-data.html","def656b2f83c6f812635fa2d797389ee"],["/src/elements/call-to-action.html","2c3c2f7cf75b39962fcb44691b50ff0f"],["/src/elements/cfp-block.html","af9bc49e476e6c11c96dc89a0598da87"],["/src/elements/drawer-block.html","a19b42803ab95c5ee9d64214cfb65804"],["/src/elements/fcm-prompt.html","4f5b80fc688904fe5db3826d6e5133aa"],["/src/elements/featured-people.html","254d16cf2e8ed54ffab8ed8b3f8e61ea"],["/src/elements/featured-stuff.html","75817e94f8ec8c937ccede7c3159b5c6"],["/src/elements/featured-videos.html","80d4e598376a9dc8df9aaf1e8ba40108"],["/src/elements/footer-block.html","77528157c4b39dab1e006cf5374df270"],["/src/elements/header-content.html","dc98a1b9da1959d7debc9a4cd8308eac"],["/src/elements/latest-posts.html","957bfef1ca3a287b85bd70dadfa11d75"],["/src/elements/login-feature-prompt.html","d9d464d088db5f3569f1ad46fc101cba"],["/src/elements/logos-block.html","3c81e279fb6a9a31b88a18fe437e2fd2"],["/src/elements/mailchimp-subscribe.html","080ada45390e247ba278fa6f5a16634f"],["/src/elements/map-block.html","745089b33ea658f413ab64637ffb76ab"],["/src/elements/my-schedule.html","e8e5976fcc9acdc8e39fa2eb77dadd8b"],["/src/elements/photo-block.html","6fc4977db8e046054608eb7f680a905e"],["/src/elements/schedule-block.html","38fd23592b102e4113313543d7defaa7"],["/src/elements/schedule-day.html","a63b4da373d3d0125b872cba5e1d5952"],["/src/elements/schedule-subnav.html","7a8325674e194283f68bbb5643f6c481"],["/src/elements/session-details.html","44c7e873bf89fbdba37c1738ba90cb2d"],["/src/elements/session-element.html","8d1810b2c80bcf1780fe794350da7da6"],["/src/elements/sessions-list.html","20b75156c0e937aba79ebe0afcadb687"],["/src/elements/social-feed.html","1c3c4d723cb2e4038e5c0e41a76ceefb"],["/src/elements/social-post.html","edfacdb6f81d4cb85b95274145adec9e"],["/src/elements/speaker-details.html","b187afdc96c187597deb35f382d2ebcf"],["/src/elements/statistics-block.html","3275ecc1d2acd05ca638506c9e38b297"],["/src/elements/ticket-element.html","5987eb876d95e02b8998c6c2f0e441b0"],["/src/elements/tickets-block.html","05e95888184e82bb8ced18ae3c853260"],["/src/elements/tickets-features-block.html","cb489655ef04052d8073ab5e6d01d3f0"],["/src/elements/toast-element.html","c0562e4956ee8b3cdd9af37d4dbf6f25"],["/src/elements/toolbar-block.html","5c74f880c1f8575a3581a8d16861d814"],["/src/elements/travel-block.html","808c7ff85b1ca96c714a34af2bd53e2c"],["/src/elements/truncate-marked-text.html","a4e2ead87bcb1526e38395b8c5525a23"],["/src/elements/video-dialog.html","77cc165d7ad1aa76df137b03af61d69d"],["/src/hoverboard-app.html","3eb72de6542d78f76a4184048664d3ff"],["/src/icons/flag-icons.html","0f9c2b737fb4f6ea23bed6a73a0cef0b"],["/src/icons/mdi.html","caed3cb8620128037ec592d4bf417069"],["/src/js-wrappers/g-plusone.html","abcc292603de43782fa49f6fd952a4a6"],["/src/js-wrappers/time-element-wrapper.html","cc26ded5c3021fdfb09304414b2e0af1"],["/src/pages/admin-page.html","5c6540644a103edfa0a10a015b30337f"],["/src/pages/blog-list.html","5eee80c27076ee627e74a4082e681e54"],["/src/pages/blog-page.html","34b0aaaf05dd8644ccb92e576924032d"],["/src/pages/cod-page.html","9675e1c152c105fb7f9071195eb4fe88"],["/src/pages/home-page.html","643e74cbde5599902934c41061c06f0a"],["/src/pages/hub-page.html","01c6005defa9052cac43e633dcfd4167"],["/src/pages/post-page.html","d43b67f1022e0a7971d96e0c2107b7ec"],["/src/pages/schedule-page.html","157efbd1ddec13b008a8f08d749c1298"],["/src/pages/sessions-page.html","fa5fe041699c7a56ffd016474090dd34"],["/src/pages/speakers-page.html","827be8f54d2cc973fcfda64f896f2d96"],["/src/pages/team-page.html","8ef235a5b5809fba090560744281cef5"],["/src/pages/travel-page.html","1447cfabb94442fdb21125d2154abe74"],["/src/styles/dialog-styles.html","cf88a9c69c622b319670f68346754202"],["/src/styles/icons.html","158f27f49ea4fb618102b0c6920a8118"],["/src/styles/mixins.html","fa2d78e1492a0df6c03153020938ad2d"],["/src/styles/shared-styles.html","f2e99b871d80c2799eacc622977bacd0"]];
/* eslint-enable quotes, comma-spacing */
var CacheNamePrefix = 'sw-precache-v1--' + (self.registration ? self.registration.scope : '') + '-';


var IgnoreUrlParametersMatching = [/^utm_/];



var addDirectoryIndex = function (originalUrl, index) {
    var url = new URL(originalUrl);
    if (url.pathname.slice(-1) === '/') {
      url.pathname += index;
    }
    return url.toString();
  };

var getCacheBustedUrl = function (url, param) {
    param = param || Date.now();

    var urlWithCacheBusting = new URL(url);
    urlWithCacheBusting.search += (urlWithCacheBusting.search ? '&' : '') +
      'sw-precache=' + param;

    return urlWithCacheBusting.toString();
  };

var isPathWhitelisted = function (whitelist, absoluteUrlString) {
    // If the whitelist is empty, then consider all URLs to be whitelisted.
    if (whitelist.length === 0) {
      return true;
    }

    // Otherwise compare each path regex to the path of the URL passed in.
    var path = (new URL(absoluteUrlString)).pathname;
    return whitelist.some(function(whitelistedPathRegex) {
      return path.match(whitelistedPathRegex);
    });
  };

var populateCurrentCacheNames = function (precacheConfig,
    cacheNamePrefix, baseUrl) {
    var absoluteUrlToCacheName = {};
    var currentCacheNamesToAbsoluteUrl = {};

    precacheConfig.forEach(function(cacheOption) {
      var absoluteUrl = new URL(cacheOption[0], baseUrl).toString();
      var cacheName = cacheNamePrefix + absoluteUrl + '-' + cacheOption[1];
      currentCacheNamesToAbsoluteUrl[cacheName] = absoluteUrl;
      absoluteUrlToCacheName[absoluteUrl] = cacheName;
    });

    return {
      absoluteUrlToCacheName: absoluteUrlToCacheName,
      currentCacheNamesToAbsoluteUrl: currentCacheNamesToAbsoluteUrl
    };
  };

var stripIgnoredUrlParameters = function (originalUrl,
    ignoreUrlParametersMatching) {
    var url = new URL(originalUrl);

    url.search = url.search.slice(1) // Exclude initial '?'
      .split('&') // Split into an array of 'key=value' strings
      .map(function(kv) {
        return kv.split('='); // Split each 'key=value' string into a [key, value] array
      })
      .filter(function(kv) {
        return ignoreUrlParametersMatching.every(function(ignoredRegex) {
          return !ignoredRegex.test(kv[0]); // Return true iff the key doesn't match any of the regexes.
        });
      })
      .map(function(kv) {
        return kv.join('='); // Join each [key, value] array into a 'key=value' string
      })
      .join('&'); // Join the array of 'key=value' strings into a string with '&' in between each

    return url.toString();
  };


var mappings = populateCurrentCacheNames(PrecacheConfig, CacheNamePrefix, self.location);
var AbsoluteUrlToCacheName = mappings.absoluteUrlToCacheName;
var CurrentCacheNamesToAbsoluteUrl = mappings.currentCacheNamesToAbsoluteUrl;

function deleteAllCaches() {
  return caches.keys().then(function(cacheNames) {
    return Promise.all(
      cacheNames.map(function(cacheName) {
        return caches.delete(cacheName);
      })
    );
  });
}

self.addEventListener('install', function(event) {
  event.waitUntil(
    // Take a look at each of the cache names we expect for this version.
    Promise.all(Object.keys(CurrentCacheNamesToAbsoluteUrl).map(function(cacheName) {
      return caches.open(cacheName).then(function(cache) {
        // Get a list of all the entries in the specific named cache.
        // For caches that are already populated for a given version of a
        // resource, there should be 1 entry.
        return cache.keys().then(function(keys) {
          // If there are 0 entries, either because this is a brand new version
          // of a resource or because the install step was interrupted the
          // last time it ran, then we need to populate the cache.
          if (keys.length === 0) {
            // Use the last bit of the cache name, which contains the hash,
            // as the cache-busting parameter.
            // See https://github.com/GoogleChrome/sw-precache/issues/100
            var cacheBustParam = cacheName.split('-').pop();
            var urlWithCacheBusting = getCacheBustedUrl(
              CurrentCacheNamesToAbsoluteUrl[cacheName], cacheBustParam);

            var request = new Request(urlWithCacheBusting,
              {credentials: 'same-origin'});
            return fetch(request).then(function(response) {
              if (response.ok) {
                return cache.put(CurrentCacheNamesToAbsoluteUrl[cacheName],
                  response);
              }

              console.error('Request for %s returned a response status %d, ' +
                'so not attempting to cache it.',
                urlWithCacheBusting, response.status);
              // Get rid of the empty cache if we can't add a successful response to it.
              return caches.delete(cacheName);
            });
          }
        });
      });
    })).then(function() {
      return caches.keys().then(function(allCacheNames) {
        return Promise.all(allCacheNames.filter(function(cacheName) {
          return cacheName.indexOf(CacheNamePrefix) === 0 &&
            !(cacheName in CurrentCacheNamesToAbsoluteUrl);
          }).map(function(cacheName) {
            return caches.delete(cacheName);
          })
        );
      });
    }).then(function() {
      if (typeof self.skipWaiting === 'function') {
        // Force the SW to transition from installing -> active state
        self.skipWaiting();
      }
    })
  );
});

if (self.clients && (typeof self.clients.claim === 'function')) {
  self.addEventListener('activate', function(event) {
    event.waitUntil(self.clients.claim());
  });
}

self.addEventListener('message', function(event) {
  if (event.data.command === 'delete_all') {
    console.log('About to delete all caches...');
    deleteAllCaches().then(function() {
      console.log('Caches deleted.');
      event.ports[0].postMessage({
        error: null
      });
    }).catch(function(error) {
      console.log('Caches not deleted:', error);
      event.ports[0].postMessage({
        error: error
      });
    });
  }
});


self.addEventListener('fetch', function(event) {
  if (event.request.method === 'GET') {
    var urlWithoutIgnoredParameters = stripIgnoredUrlParameters(event.request.url,
      IgnoreUrlParametersMatching);

    var cacheName = AbsoluteUrlToCacheName[urlWithoutIgnoredParameters];
    var directoryIndex = 'index.html';
    if (!cacheName && directoryIndex) {
      urlWithoutIgnoredParameters = addDirectoryIndex(urlWithoutIgnoredParameters, directoryIndex);
      cacheName = AbsoluteUrlToCacheName[urlWithoutIgnoredParameters];
    }

    var navigateFallback = '/index.html';
    // Ideally, this would check for event.request.mode === 'navigate', but that is not widely
    // supported yet:
    // https://code.google.com/p/chromium/issues/detail?id=540967
    // https://bugzilla.mozilla.org/show_bug.cgi?id=1209081
    if (!cacheName && navigateFallback && event.request.headers.has('accept') &&
        event.request.headers.get('accept').includes('text/html') &&
        /* eslint-disable quotes, comma-spacing */
        isPathWhitelisted(["^\\/[^\\_]+\\/"], event.request.url)) {
        /* eslint-enable quotes, comma-spacing */
      var navigateFallbackUrl = new URL(navigateFallback, self.location);
      cacheName = AbsoluteUrlToCacheName[navigateFallbackUrl.toString()];
    }

    if (cacheName) {
      event.respondWith(
        // Rely on the fact that each cache we manage should only have one entry, and return that.
        caches.open(cacheName).then(function(cache) {
          return cache.keys().then(function(keys) {
            return cache.match(keys[0]).then(function(response) {
              if (response) {
                return response;
              }
              // If for some reason the response was deleted from the cache,
              // raise and exception and fall back to the fetch() triggered in the catch().
              throw Error('The cache ' + cacheName + ' is empty.');
            });
          });
        }).catch(function(e) {
          console.warn('Couldn\'t serve response for "%s" from cache: %O', event.request.url, e);
          return fetch(event.request);
        })
      );
    }
  }
});




