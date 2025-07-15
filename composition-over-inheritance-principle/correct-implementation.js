/**
 * Composition over Inheritance Principle - Correct Implementation
 *
 * The Composition over Inheritance principle suggests that you should favor object composition
 * over class inheritance when designing your code. Instead of creating complex inheritance
 * hierarchies, compose objects by combining simpler objects and behaviors.
 *
 * In this example, we use composition to create different types of characters in a game
 * by combining various abilities and traits rather than using inheritance.
 */

// Define simple, focused ability components
const walker = {
  walk() {
    console.log('Walking...');
    return 'Walking';
  }
};

const swimmer = {
  swim() {
    console.log('Swimming...');
    return 'Swimming';
  }
};

const flyer = {
  fly() {
    console.log('Flying...');
    return 'Flying';
  }
};

const attacker = {
  attack(target) {
    console.log(`Attacking ${target} with strength ${this.strength}`);
    return `Attacked ${target}`;
  }
};

const defender = {
  defend() {
    console.log(`Defending with shield strength ${this.defense}`);
    return `Defended with ${this.defense} strength`;
  }
};

// Character factory function that composes objects with selected abilities
function createCharacter(name, traits = {}) {
  // Base character properties
  const character = {
    name,
    health: traits.health || 100,
    strength: traits.strength || 10,
    defense: traits.defense || 10,
    describe() {
      return `${this.name} - Health: ${this.health}, Strength: ${this.strength}, Defense: ${this.defense}`;
    }
  };

  // Return the character with composed abilities
  return character;
}

// Create specific character types by composing different abilities
function createWarrior(name, traits = {}) {
  return Object.assign(
    createCharacter(name, traits),
    walker,
    attacker,
    defender
  );
}

function createMage(name, traits = {}) {
  const mage = Object.assign(
    createCharacter(name, traits),
    walker,
    attacker
  );

  // Add mage-specific abilities
  mage.castSpell = function(spell, target) {
    console.log(`Casting ${spell} on ${target}`);
    return `Cast ${spell}`;
  };

  return mage;
}

function createAmphibiousWarrior(name, traits = {}) {
  return Object.assign(
    createCharacter(name, traits),
    walker,
    swimmer,
    attacker,
    defender
  );
}

function createFlyingMage(name, traits = {}) {
  const flyingMage = Object.assign(
    createCharacter(name, traits),
    walker,
    flyer,
    attacker
  );

  flyingMage.castSpell = function(spell, target) {
    console.log(`Casting ${spell} on ${target} from the air`);
    return `Cast ${spell} from air`;
  };

  return flyingMage;
}

// Usage
const warrior = createWarrior('Aragorn', { strength: 20, defense: 15 });
const mage = createMage('Gandalf', { health: 80, strength: 5 });
const amphibiousWarrior = createAmphibiousWarrior('Aquaman', { strength: 18 });
const flyingMage = createFlyingMage('Storm', { health: 90 });

console.log(warrior.describe());
warrior.walk();
warrior.attack('Orc');
warrior.defend();

console.log(mage.describe());
mage.walk();
mage.castSpell('Fireball', 'Dragon');

console.log(amphibiousWarrior.describe());
amphibiousWarrior.swim();
amphibiousWarrior.attack('Sea monster');

console.log(flyingMage.describe());
flyingMage.fly();
flyingMage.castSpell('Lightning', 'Ground troops');

// This demonstrates Composition over Inheritance because:
// 1. We create complex objects by combining simpler objects (composition)
// 2. We can easily create new character types by mixing different abilities
// 3. We avoid deep inheritance hierarchies and their associated problems
// 4. Each ability is defined once and reused across different character types
// 5. The code is more flexible and easier to extend with new character types