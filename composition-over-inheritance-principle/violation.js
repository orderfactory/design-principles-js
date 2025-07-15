/**
 * Composition over Inheritance Principle - Violation Example
 *
 * This example demonstrates a violation of the Composition over Inheritance principle
 * by creating a rigid inheritance hierarchy for game characters instead of using composition.
 *
 * The inheritance approach creates several problems:
 * 1. Inflexible class hierarchy that's difficult to extend
 * 2. Code duplication across different branches of the hierarchy
 * 3. The "diamond problem" when using multiple inheritance
 * 4. Tight coupling between parent and child classes
 */

// Base Character class
class Character {
  constructor(name) {
    this.name = name;
    this.health = 100;
    this.strength = 10;
    this.defense = 10;
  }

  describe() {
    return `${this.name} - Health: ${this.health}, Strength: ${this.strength}, Defense: ${this.defense}`;
  }

  walk() {
    console.log('Walking...');
    return 'Walking';
  }
}

// First level of inheritance
class Warrior extends Character {
  constructor(name) {
    super(name);
    this.strength = 20;
    this.defense = 15;
  }

  attack(target) {
    console.log(`Attacking ${target} with strength ${this.strength}`);
    return `Attacked ${target}`;
  }

  defend() {
    console.log(`Defending with shield strength ${this.defense}`);
    return `Defended with ${this.defense} strength`;
  }
}

class Mage extends Character {
  constructor(name) {
    super(name);
    this.health = 80;
    this.strength = 5;
  }

  attack(target) {
    console.log(`Attacking ${target} with strength ${this.strength}`);
    return `Attacked ${target}`;
  }

  castSpell(spell, target) {
    console.log(`Casting ${spell} on ${target}`);
    return `Cast ${spell}`;
  }
}

// Second level of inheritance - now it gets complicated
class SwimmingWarrior extends Warrior {
  swim() {
    console.log('Swimming...');
    return 'Swimming';
  }
}

class FlyingWarrior extends Warrior {
  fly() {
    console.log('Flying...');
    return 'Flying';
  }
}

class SwimmingMage extends Mage {
  swim() {
    console.log('Swimming...');
    return 'Swimming';
  }
}

class FlyingMage extends Mage {
  fly() {
    console.log('Flying...');
    return 'Flying';
  }

  // We need to override this method to add flying-specific behavior
  castSpell(spell, target) {
    console.log(`Casting ${spell} on ${target} from the air`);
    return `Cast ${spell} from air`;
  }
}

// What if we want a character that can both swim and fly?
// We'd need to create yet another class or use multiple inheritance (if supported)
class SwimmingFlyingWarrior extends SwimmingWarrior {
  fly() {
    console.log('Flying...');
    return 'Flying';
  }
}

// Usage
const warrior = new Warrior('Aragorn');
const mage = new Mage('Gandalf');
const swimmingWarrior = new SwimmingWarrior('Aquaman');
const flyingMage = new FlyingMage('Storm');
const swimmingFlyingWarrior = new SwimmingFlyingWarrior('Wonder Woman');

console.log(warrior.describe());
warrior.walk();
warrior.attack('Orc');
warrior.defend();

console.log(mage.describe());
mage.walk();
mage.castSpell('Fireball', 'Dragon');

console.log(swimmingWarrior.describe());
swimmingWarrior.swim();
swimmingWarrior.attack('Sea monster');

console.log(flyingMage.describe());
flyingMage.fly();
flyingMage.castSpell('Lightning', 'Ground troops');

console.log(swimmingFlyingWarrior.describe());
swimmingFlyingWarrior.swim();
swimmingFlyingWarrior.fly();

// This violates Composition over Inheritance because:
// 1. We have a rigid class hierarchy that's difficult to extend
// 2. Adding new abilities requires creating new subclasses
// 3. There's code duplication (swim and fly methods are duplicated)
// 4. We can't easily create characters with arbitrary combinations of abilities
// 5. The inheritance hierarchy becomes exponentially complex as we add more abilities
// 6. Changes to parent classes can unexpectedly affect child classes