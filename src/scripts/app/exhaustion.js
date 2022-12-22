async function updateExhaustion(actorEntity) {
  
  if (game.actors.get(actorEntity._id).type !== "character") {
    return;
  }
  
  let exhaustion = actorEntity.system.attributes.exhaustion;

  if(game.settings.get("foundryvtt-tidy5e-sheet-nolat", 'exhaustionEffectsEnabled') == 'tidy5e') {
    let icon = game.settings.get("foundryvtt-tidy5e-sheet-nolat", 'exhaustionEffectIcon');
    let currentExhaustion;
    let exhaustionPresent = null;
    let effectName = `${game.i18n.localize("DND5E.ConExhaustion")} ${game.i18n.localize("DND5E.AbbreviationLevel")} ${exhaustion}`;

    // define exhaustion effects by level
    let exhaustionSet = [];
    if(exhaustion != 0){
      if (exhaustion <= 10) {
        let effect = {
          key: "data.bonuses.All-Attacks",
          value: -exhaustion,
          mode: CONST.ACTIVE_EFFECT_MODES.ADD,
          priority: 20,
        };
        exhaustionSet.push(effect);

        effect = {
          key: "data.bonuses.abilities.save",
          value: -exhaustion,
          mode: CONST.ACTIVE_EFFECT_MODES.ADD,
          priority: 20,
        };
        exhaustionSet.push(effect);

        effect = {
          key: "data.bonuses.abilities.check",
          value: -exhaustion,
          mode: CONST.ACTIVE_EFFECT_MODES.ADD,
          priority: 20,
        };
        exhaustionSet.push(effect);
      }

      if (exhaustion > 10) {
        let effect = {
          key: "data.attributes.hp.value",
          value: "0",
          mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
          priority: 20,
        };
        exhaustionSet.push(effect);
      }
    }

    for (const effectEntity of actorEntity.effects) {
      if (typeof effectEntity.getFlag("foundryvtt-tidy5e-sheet-nolat", 'exhaustion') === 'number') {
        exhaustionPresent = effectEntity;
        currentExhaustion = effectEntity.getFlag("foundryvtt-tidy5e-sheet-nolat", 'exhaustion');
        // console.log(currentExhaustion);
        if (currentExhaustion != exhaustion) {
          await exhaustionPresent.delete();
          createExhaustionEffect();
        }
      }
    }

    if(!exhaustionPresent) {
      createExhaustionEffect();
    }
    
    async function createExhaustionEffect(){
      if (exhaustion > 0){
        // console.log('create Effect!');
    
        let effectChange = {
          disabled: false,
          label: effectName,
          icon: icon,
          changes: exhaustionSet,
          duration: {'seconds': 31536000},
          flags: {
            "foundryvtt-tidy5e-sheet-nolat": {
              'exhaustion': exhaustion
            }
          },
          origin: `Actor.${actorEntity._id}`
        };
        
        await actorEntity.createEmbeddedDocuments("ActiveEffect", [effectChange]);
        await actorEntity.applyActiveEffects();  
      }
    }
  }

  if(game.settings.get("foundryvtt-tidy5e-sheet-nolat", 'exhaustionEffectsEnabled') == 'custom'){	
    const levels = game.settings.get("foundryvtt-tidy5e-sheet-nolat", 'exhaustionEffectCustomTiers');
    const effectName = game.settings.get("foundryvtt-tidy5e-sheet-nolat", 'exhaustionEffectCustom');

    const id = actorEntity._id;
    const tokens = canvas.tokens.placeables;
    const index = tokens.findIndex(x => x.actor._id === id);
    const token = tokens[index];
    
    for(let i = 1; i<=levels; i++){
      let tier = `${effectName} ${i}`;
      if (game.cub.hasCondition(tier, [token]) && tier != `${effectName} ${exhaustion}`){
        // console.log(tier);
        await game.cub.removeCondition(tier, [token]);
      }
    }

    if(exhaustion != 0){
      let effect = `${effectName} ${exhaustion}`;
      if(index == -1){
        ui.notifications.warn(`${game.i18n.localize("TIDY5E.Settings.CustomExhaustionEffect.warning")}`);
        return;
      }
      game.cub.addCondition(effect, [token])
    }
  }
}

// Hooks Update Actor
Hooks.on('updateActor', function (actorEntity, _, __, userId) {
  if(game.settings.get("foundryvtt-tidy5e-sheet-nolat", 'exhaustionEffectsEnabled') != 'default') {
    if (game.userId !== userId || actorEntity.constructor.name != "Actor5e") {
      // Only act if we initiated the update ourselves, and the effect is a child of a character
      return;
    }
    updateExhaustion(actorEntity);
  }
  // console.log('actor updated!')
});

// Rest reduces by 1
Hooks.on(`restCompleted`, (actorEntity, data) => { 
  if(game.settings.get("foundryvtt-tidy5e-sheet-nolat", 'exhaustionEffectsEnabled') == 'default') {
    return
  }
  let actor = game.actors.get(actorEntity._id);
  if(data.longRest){
    let exhaustion = actorEntity.system.attributes.exhaustion;
    if (exhaustion > 0) actor.update({"data.attributes.exhaustion": exhaustion-1});
  }
});

// set exhaustion value to cub effect level
Hooks.on(`createActiveEffect`, (effect, data, id) => { 
  if(game.settings.get("foundryvtt-tidy5e-sheet-nolat", 'exhaustionEffectsEnabled') == 'custom') {

    let actor = game.actors.get(effect.parent._id);
    let effectName = effect.label;
    if (effectName.includes(game.settings.get("foundryvtt-tidy5e-sheet-nolat", 'exhaustionEffectCustom'))) {
      // console.log(effectName);
      let exhaustion = effectName.slice(-1);
      // console.log(exhaustion);
      actor.update({"system.attributes.exhaustion": exhaustion});
    }
  }
});

// reset exhaustion value when cub effect is removed
Hooks.on(`deleteActiveEffect`, (effect, data, id) => { 
  if(game.settings.get("foundryvtt-tidy5e-sheet-nolat", 'exhaustionEffectsEnabled') == 'custom') {
    const actor = game.actors.get(effect.parent._id);
    const effectName = game.settings.get("foundryvtt-tidy5e-sheet-nolat", 'exhaustionEffectCustom');
    const levels = game.settings.get("foundryvtt-tidy5e-sheet-nolat", 'exhaustionEffectCustomTiers');
    const effectLabel = effect.label;
    if (effectLabel.includes(effectName)) {

    const tokens = canvas.tokens.placeables;
    const index = tokens.findIndex(x => x.actor._id === effect.parent._id);
    const token = tokens[index];

      for(let i = 1; i<=levels; i++){
        let tier = `${effectName} ${i}`;
        if (game.cub.hasCondition(tier, [token])){
          return
        }
      }

      actor.update({"system.attributes.exhaustion": 0});
    }
  }
});
