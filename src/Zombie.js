var Zombie = cc.Sprite.extend({
    _gameLayer:null,
    _posX:0,
    _state:ZH.SPRITE_STATE.IDLE,
    _rotationAmount:0,

    ctor:function(gameLayer) {

        this._gameLayer = gameLayer;

        this.initWithFile(s_ZombieHead);
        //this.setScale(0.10);
        this.setAnchorPoint(cc.p(0.5, 0.5));
        this.setPosition(cc.p(-550,-550));

    },

    hit:function() {
        if (this._state == ZH.SPRITE_STATE.ACTIVE) {
            this._state = ZH.SPRITE_STATE.DEAD;
            cc.AudioEngine.getInstance().stopAllEffects();
            cc.AudioEngine.getInstance().playEffect(s_ZombieKill_mp3);
            this.stopAllActions();
            var actions = [];
            actions[0] = cc.FadeOut.create();
            actions[1] = cc.CallFunc.create(this, this.destroy);
            this.runAction(cc.Sequence.create(actions));
        }
    },

    active:function() {
        this._state = ZH.SPRITE_STATE.ACTIVE;
    },
    destroy:function() {
        this._state = ZH.SPRITE_STATE.DEAD;
        this.setPosition(cc.p(-500, -500));
        this.runAction(cc.FadeIn.create(0.1));
        cc.ArrayRemoveObject(ZH.ZOMBIES,this);
        this.removeFromParentAndCleanup();
    },

    newGame:function() {
        this._state = ZH.SPRITE_STATE.IDLE;
        var size = cc.Director.getInstance().getWinSize();

        this.stopAllActions();
        var yfactor = size.height / 2;
        var xfactor = size.width / 2;

        var verts = [];
        verts[0] = {x:-500.4, y:500.9 ,delay: 0.1 };
        verts[1] = {x:-500,   y:21.9 ,delay: 0.5 };
        verts[2] = {x:-395.4, y:21.9 ,delay: 0.5 };
        verts[3] = {x:-253.3, y:78.1 ,delay: 1 };
        verts[4] = {x:43.6,   y:-48.6,delay: 1 };
        verts[5] = {x:284.0,  y:41.1 ,delay: 1 };
        verts[6] = {x:393.4,  y:38.2 ,delay: 1 };
        verts[7] = {x:410.4,  y:38.2 ,delay: 0.2 };
        verts[8] = {x:500.4,  y:500.9 ,delay: 0 };

        var actions= [];
        var actIdx = 0;
        for (var i=0; i < verts.length; i++) {
            actions[actIdx++] = cc.MoveTo.create(verts[i].delay, cc.p(xfactor + verts[i].x, yfactor + verts[i].y));
        }

        // initial position
        this.setPosition(cc.p(xfactor + verts[0].x - 20, yfactor + verts[0].y - 10));

        var sequence = cc.Sequence.create(actions);
        this.runAction(cc.RepeatForever.create(sequence));

        this._rotationAmount = 0;
        this.schedule(function()
        {
            this.setRotation(this._rotationAmount+=5);
            if(this._rotationAmount > 360)
                this._rotationAmount = 0;
        }, 0.01, cc.REPEAT_FOREVER);
        this.scheduleUpdate();

    },

    collisionRect:function(){
        var p = this.getPosition();
        var a = this.getContentSize();
        var r = new cc.rect(p.x - a.width/2, p.y - a.height/2, a.width, a.height/2);
        return r;
    }

});
