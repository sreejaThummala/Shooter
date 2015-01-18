
var Fork = cc.Sprite.extend({
    _gameLayer:null,
    _winSize:null,


    ctor:function(gameLayer, startPos) {
        this._winSize = cc.Director.getInstance().getWinSize();
        this._gameLayer = gameLayer;

        this.initWithFile(s_Fork);
        //this.setScale(0.3);

        var delay = 1 + (2 * Math.random());
        var curX = startPos.x;

        this.setPosition(startPos);

        var actions = [];
        actions[0] = cc.MoveTo.create(delay, cc.p(curX, 500));
        actions[1] = cc.CallFunc.create(this, this.removeFork);

        this.runAction(cc.Sequence.create(actions));

        this.scheduleUpdate();
    },

    destroy:function() {
        var pos = this.getPosition();
        var hitEffect = cc.ParticleSystemQuad.create(s_ZombieHit_plist);
        hitEffect.stopSystem();
        this._gameLayer.addChild(hitEffect, 10);
        hitEffect.setPosition(pos);
        hitEffect.resetSystem();
        var actions = [];
        actions[0] = cc.DelayTime.create(2.0);
        actions[1] = cc.CallFunc.create(this, function() {
            this._gameLayer.removeChild(hitEffect);
        })
        this.runAction(cc.Sequence.create(actions));
    },

    removeFork:function() {
        cc.ArrayRemoveObject(ZH.FORKS, this);
        this._gameLayer.removeChild(this, true);
    },

    collisionRect:function() {
        var p = this.getPosition();
        var a = this.getContentSize();
        return cc.rect(p.x, p.y, a.width-4, a.height-4);
    }

});