var testSettings = require('../testSettings');

var should = require('should'),
    mongo = require('mongodb'),
    coreServices = require('../../core/coreServices'),
    controllerHelper = coreServices.controllerHelpers,
    gameCommands = require('../../core/commands/gameCommands'),
    gameController = require('../../controllers/gameController'),
    GameStates = require('../../core/game/gameStates'),
    GameSystem = require('../../core/game/server/serverRegistry'),
    PlayerDirections = GameSystem.PlayerDirections,
    typeConverter = coreServices.typeConverter,
    filters = coreServices.filters;

describe('gameController', function(){

    var req, resp;

    var nextTriggered = false;

    function next(){
        nextTriggered = true;
    }
    function getCurrentUserId(req){
        var currentUserId = req.session.userId;

        if (typeof(currentUserId) == 'string')
            currentUserId = typeConverter.fromString.toObjectId(currentUserId);

        return currentUserId;
    }

    beforeEach(function(done){
        req = {
            params : {},
            session:{
                userId : new mongo.ObjectID().toString()
            }

        };

        resp = {

            redirect : function(url){
                resp.url = url;
            },

            render : function(view, model){
                resp.view = view;
                resp.locals = model;
            }
        };



        nextTriggered = false;
        done();
    });

    describe('create.handler', function(){


        it('should redirect to main menu if failed to create new game', function(done){
            req.params.mode='1p';
            req.params.type='heroine';

            var originalMethod = gameCommands.create;
            gameCommands.create = function(game, result){
                result({
                    error : {message:'error'}
                });
            };


            gameController.create.handler(req, resp, next);
            gameCommands.create = originalMethod;
            resp.url.should.equal('/main-menu');
            done();

        });

        it('redirect to game page after create new game record', function(done){

            req.params.mode='1p';
            req.params.type='heroine';
            var id = new mongo.ObjectID();
            var originalMethod = gameCommands.create;
            gameCommands.create = function(game, result){
                result({
                    doc :{
                        _id: id
                    }
                });
            };

            gameController.create.handler(req, resp, next);
            gameCommands.create = originalMethod;
            resp.url.should.equal('/game/'+id.toString());
            done();
        });
    });


    describe('index.handler', function(){

        it('should redirect to main menu if id is invalid', function(done){
            var id = new mongo.ObjectID();
            req.params.id = id.toString();
            var originalMethod = gameCommands.getById;
            gameCommands.getById = function(game, result){
                result({ });
            };
            gameController.index.handler(req, resp, next);
            gameCommands.getById = originalMethod;
            resp.url.should.equal('/main-menu');
            done();

        });

        it('render page if data found', function(done){
            var id = new mongo.ObjectID();
            req.params.id = id.toString();
            var playerId = getCurrentUserId(req);
            var originalMethod = gameCommands.getById;
            gameCommands.getById = function(game, result){
                result({
                doc:{
                      //id  :id,
                      mode: '1p',
                      players : {
                          girl : {
                              id :  playerId,
                              type : GameSystem.PlayerTypes.Girl,
                              direction: PlayerDirections.Left,
                              map : 'Map1',
                              //auto: !isHeroine,
                              trace: true
                          }
                      }

                }});
            };

            gameController.index.handler(req, resp, next);
            gameCommands.getById =originalMethod;
            resp.view.should.equal('game/index');

            done();
        });

    });
});
