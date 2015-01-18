var _menu = null;

var GameLayer = cc.Layer.extend({
    isMouseDown:false,
    _winSize:null,
    _playerSprite:null,
    _forksLabel:null,
    _zombiesLabel:null,
    _gameOverLabel:null,
    _gameLayer:null,
    _zombies:null,
    _zombieCount:null,
    _zombieMax:15,
    _time:null,
    _curTime:null,
    _state:null,

    init:function () {

        this._super();

        this._winSize = cc.Director.getInstance().getWinSize();
        this._state = ZH.GAME_STATE.NEW;

        // Main game layer
        this._gameLayer = new cc.LazyLayer();
        this.addChild(this._gameLayer);

        // Fork cache count
        this._forksLabel = cc.LabelTTF.create("Forks: " + ZH._forkCache, "Acme", 25);
        this._forksLabel.setPosition(cc.p(715, 425));
        this._gameLayer.addChild(this._forksLabel, 100);

        // Zombie head count
        this._zombiesLabel = cc.LabelTTF.create("Zombies: " + ZH.ZOMBIES.length, "Acme", 25);
        this._zombiesLabel.setPosition(cc.p(100, 425));
        this._gameLayer.addChild(this._zombiesLabel, 100);

        this._gameOverLabel = cc.LabelTTF.create("Game Over!", "Acme", 60);
        this._gameOverLabel.setPosition(cc.p(this._winSize.width / 2, -500));
        this._gameLayer.addChild(this._gameOverLabel);

        // the Forkinator!
        this._playerSprite = new Forkinator(this._gameLayer);
        this._gameLayer.addChild(this._playerSprite, 10);
        this._playerSprite.setPosition(cc.p(-500,-500));

        cc.AudioEngine.getInstance().setBackgroundMusicVolume(0.2);
        cc.AudioEngine.getInstance().playBackgroundMusic(s_Background_mp3, true);

        // Add Enemies
        this._zombieCount = 0;
        this._zombies = [];
        for (var i=0; i < this._zombieMax; i++) {
            this._zombies[i] = new Zombie(this);
        }

        // Create background
        this.createBackground();

        this.createPlayMenu();

        // Enable input
        var t = cc.config.deviceType;
        if( t == 'browser' )  {
            this.setTouchEnabled(true);
            this.setKeyboardEnabled(true);
        } else if( t == 'mobile' ) {
            this.setTouchEnabled(true);
        }

        this.scheduleUpdate();

        return true;
    },

    createBackground:function() {
        this._backSky = cc.Sprite.create(s_NightBackground);
        this._backSky.setAnchorPoint(cc.p(0, 0));
        this._backSkyHeight = this._backSky.getContentSize().height;
        this._gameLayer.addChild(this._backSky, -10);

    },

    createPlayMenu:function() {
        var newGame = cc.MenuItemImage.create(s_NewGameNormal, s_NewGameSelected, this, 'onNewGame');

        _menu = cc.Menu.create(newGame);
        _menu.alignItemsVerticallyWithPadding(10);
        _menu.setPosition(cc.p(this._winSize.width / 2, this._winSize.height / 2));
        this._gameLayer.addChild(_menu, 500);
    },

    onNewGame:function() {
        var i;
        for (i=0; i < ZH.ZOMBIES.length; i++) {
            var zombie = ZH.ZOMBIES[i];
            zombie.destroy();
        }
        this._gameOverLabel.setPosition(cc.p(this._winSize.width / 2, -500));
        this._gameOverLabel.runAction(cc.FadeOut.create(0.5));
        _menu.setEnabled(false);
        _menu.runAction(cc.Sequence.create(cc.FadeOut.create(0.5), cc.CallFunc.create(this, function() {
            var winSize = cc.Director.getInstance().getWinSize();
            _menu.setPosition(cc.p(winSize.width / 2, -500));
        })));
        ZH._currentGameState = ZH.GAME_STATE.PLAYING;
        ZH._forkCache =  20;
        ZH._forkFired = false;
        ZH._forksAway = 0;
        this._zombieCount = 0;
        for (i=0; i < this._zombieMax; i++) {
            this._zombies[i].newGame();
        }
        this._playerSprite.newGame();
    },

    addZombieToGameLayer:function() {
        var zombie = this._zombies[this._zombieCount];
        zombie.active();
        this._gameLayer.addChild(zombie, 10);
        this._zombieCount++;
        ZH.ZOMBIES.push(zombie);
    },

    update:function(dt) {

        this._time++;

        var minute = 0 | (this._time / 60);
        var second = this._time % 60;
        minute = minute > 9 ? minute : "0" + minute;
        second = second > 9 ? second : "0" + second;
        this._curTime = minute + ":" + second;

        if (ZH._currentGameState == ZH.GAME_STATE.PLAYING) {
            if (this._playerSprite.getPositionX() == -500 && this._playerSprite.isActive()) {
                this._playerSprite.setDefaultPosition();
            }

            if(ZH._forkCache >= 0 && ZH.ZOMBIES.length == 0 && this._zombieCount == this._zombieMax) {
                ZH._currentGameState = ZH.GAME_STATE.GAME_OVER;
                cc.AudioEngine.getInstance().playEffect(s_GameWon_mp3);
                this._gameOverLabel.setString("You Win!");
                this._gameOverLabel.runAction(cc.FadeIn.create(0.9));
                this._gameOverLabel.setPosition(cc.p(this._winSize.width / 2, this._winSize.height / 2 + 100));
                _menu.setEnabled(true);
                _menu.setPosition(cc.p(this._winSize.width / 2, this._winSize.height / 2));
                _menu.runAction(cc.FadeIn.create(0.5));
            }

            if (this._playerSprite.isOffscreen()) {
                ZH._currentGameState = ZH.GAME_STATE.GAME_OVER;
                var i;
                for (i=0; i < ZH.ZOMBIES.length; i++) {
                    var zombie = ZH.ZOMBIES[i];
                    zombie.destroy();
                    this._gameLayer.removeChild(zombie);
                }
                this._gameOverLabel.setString("You Lose!");
                this._gameOverLabel.runAction(cc.FadeIn.create(0.9));
                this._gameOverLabel.setPosition(cc.p(this._winSize.width / 2, this._winSize.height / 2 + 100));
                _menu.setEnabled(true);
                _menu.setPosition(cc.p(this._winSize.width / 2, this._winSize.height / 2));
                _menu.runAction(cc.FadeIn.create(0.5));
            }

            // fire rhythm
            if (second % 20 == 0) {
                ZH.forkFired = false;
            }

            this._forksLabel.setString("Forks: " + ZH._forkCache);
            this._zombiesLabel.setString("Zombies: " + ZH.ZOMBIES.length);

            // check collisions
            this.processCollisions();

            // add zombies
            if (second == '10' && this._zombieCount < this._zombieMax) {
                this.addZombieToGameLayer();
            }
        }

    },

    processCollisions:function() {
        var enemy;
        for (var i=0; i < ZH.ZOMBIES.length; i++) {
            enemy = ZH.ZOMBIES[i];
            for (var j=0; j < ZH.FORKS.length; j++) {
                var fork = ZH.FORKS[j];
                var r1 = enemy.collisionRect();
                var r2 = fork.collisionRect();
                if (cc.rectIntersectsRect(r1, r2)) {
                    enemy.hit();
                    fork.destroy();
                    this._gameLayer.removeChild(fork, true);
                    this._gameLayer.removeChild(enemy, true);
                    // remove from globals
                    ZH.FORKS.splice(j,1);
                    ZH.ZOMBIES.splice(i,1);
                }
            }
        }
    },

    onKeyDown:function (e) {
        ZH.KEYS[e] = true;
    },

    onKeyUp:function (e) {
        ZH.KEYS[e] = false;
        if (e == cc.KEY.space) {
            ZH._forksAway++;
        }
        if (e == cc.KEY.f) {
            ZH._forkCache++;
        }
    },
    onTouchesBegan:function(touches, event){
        this._isTouch = true;
    },
    onTouchesMoved:function (touches, event) {
        if(this._isTouch){
            this.processEvent(touches[0]);
        }
    },
    onTouchesEnded:function(touches, event){
        this._isTouch = false;
    },
    onMouseDragged:function( event ) {
        if(this._isTouch){
            this.processEvent( event );
        }
    },
    processEvent:function( event ) {

    }



});

var MyScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new GameLayer();
        this.addChild(layer);
        layer.init();
    }
});
