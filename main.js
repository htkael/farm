import { getAllMethods, getChildName } from "./helpers.js"
import Shell from "./shell.js"

export class World {
  constructor() {
    this.animals = []
    this.interval = 0
  }

  addAnimal(animal) {
    this.animals.push(animal)
    console.log(`${animal.species} entered the world!`)
  }

  randomInteraction() {
    if (this.animals.length < 2) return

    const animal1 = this.animals[Math.floor(Math.random() * this.animals.length)]
    const animal2 = this.animals[Math.floor(Math.random() * this.animals.length)]

    if (animal1.health <= 0) return

    if (animal1 === animal2) return

    const action = Math.random()

    const animalActions = getAllMethods(animal1)
    const baseMethodsToExclude = ['constructor', 'breedWith', 'takeDamage', 'gainXP', 'levelUp']
    const availableActions = animalActions.filter(method => !baseMethodsToExclude.includes(method))

    if (action < 0.3) {
      if (availableActions.length > 0) {
        const randomMethod = availableActions[Math.floor(Math.random() * availableActions.length)]
        console.log(`${animal1.name || animal1.species} uses ${randomMethod}!`)

        const methodsThatNeedTarget = ['attack', 'bite', 'eviscerate', 'sacrifice', 'attack', 'devour', 'charge', 'scratch', 'aerialAttack', 'camoflaugeAttack']
        if (methodsThatNeedTarget.includes(randomMethod)) {
          animal1[randomMethod](animal2)
        } else {
          animal1[randomMethod]()
        }
      }
    } else if (action < 0.7 && typeof animal1.breedWith === 'function') {
      const baby = animal1.breedWith(animal2)
      if (baby) {
        console.log(`A new ${baby.species} was born: ${baby.name}!`)
        this.addAnimal(baby)
      }
    } else if (action >= 0.995) {
      const mutant = this.createMutant(animal1, animal2)
      console.log(`🧬 MUTATION! A new species has evolved: ${mutant.species}!`)
      this.addAnimal(mutant)
    }
  }

  createMutant(parent1, parent2) {
    const mutantSpecies = getChildName(parent1.species, parent2.species)
    const mutantSound = this.mutateTrait(parent1.sound, parent2.sound, "sound")
    const mutantFood = this.mutateTrait(parent1.food, parent2.food, "food")
    const mutantHealth = Math.floor((parent1.maxHealth + parent2.maxHealth) / 2) + Math.floor(Math.random() * 10 - 5)
    const mutantName = `${mutantSpecies}-Alpha`

    const mutant = new Animal(mutantSpecies, mutantSound, mutantFood, mutantHealth)
    mutant.name = mutantName

    this.giveRandomAbility(mutant, parent1, parent2)

    return mutant
  }

  mutateTrait(trait1, trait2, traitType) {
    const mutation = Math.random()
    if (mutation < 0.4) return trait1
    if (mutation < 0.8) return trait2

    return this.generateRandomTrait(trait1, trait2, traitType)
  }

  generateRandomTrait(trait1, trait2, traitType) {
    const sounds = ['ROAR!', "Meow!", "Screech!", "Chirp!", "Glorp!", "Brrrr...", "Howl!", "Moooo!", "Bing Bong!"]
    const foods = ['Meat', 'Berries', 'Fish', 'Insects', 'Grass', 'Bones']

    if (traitType === "sound") {
      return sounds[Math.floor(Math.random() * sounds.length)]
    } else if (traitType === "food") {
      return foods[Math.floor(Math.random() * foods.length)]
    } else {
      return Math.random() < 0.5 ? trait1 : trait2
    }
  }

  giveRandomAbility(mutant, parent1, parent2) {
    const abilities = [
      () => {
        mutant.bite = function(otherAnimal) {
          console.log(`${this?.name || this?.species} bit ${otherAnimal?.name || otherAnimal?.species}`)
          otherAnimal.takeDamage(8)
        }
      },
      () => {
        mutant.regenerate = function() {
          this.health = Math.min(this.health + 10, this.maxHealth)
          console.log(`${this?.name || this.species} regenerated. Current health: ${this.health}`)
        }
      },
      () => {
        mutant.eviscerate = function(otherAnimal) {
          console.log(`${this?.name || this?.species} eviscerated ${otherAnimal?.name || otherAnimal?.species}`)
          otherAnimal.takeDamage(15)
        }
      },
      () => {
        mutant.sacrifice = function(otherAnimal) {
          console.log(`${this?.name || this?.species} made the ultimate sacrifice. ${otherAnimal?.name || otherAnimal?.species} and it have died.`)
          this.health = 0
          otherAnimal.health = 0
        }
      }
    ]

    const numGiven = Math.random() > 0.5 ? 1 : 2

    for (let i = 0; i < numGiven; i++) {
      const randomAbility = abilities[Math.floor(Math.random() * abilities.length)]
      randomAbility()
    }

    console.log(`New abilities: ${Object.keys(mutant).filter(k => typeof mutant[k] === 'function' && !['makeSound', 'eat', 'attack', 'takeDamage', 'breedWith', 'heal', 'devour'].includes(k)).join(', ')}`)

    mutant.breedWith = function(other) {
      if (this.species !== other.species) return null

      const childName = getChildName(this.name, other.name)
      const childHealth = Math.floor((this.health + other.health) / 2)

      const child = new Animal(this.species, this.sound, this.food, childHealth)
      child.name = childName

      for (let key in this) {
        if (typeof this[key] === 'function' && !['makeSound', 'eat', 'attack', 'takeDamage', 'breedWith', 'heal', 'devour'].includes(key)) {
          child[key] = this[key]
        }
      }

      child.breedWith = this.breedWith

      console.log(`${this.name} and ${other.name} had a ${this.species} baby!`)

      return child
    }
  }

  startSimulation(interval = 2000) {
    setInterval(() => {
      this.randomInteraction()

      if (this.interval === 5) {
        this.logPopulation()
        this.interval = 0
      }

      this.interval++

    }, interval)
  }

  logPopulation() {
    const species = {}
    this.animals.forEach(a => {
      if (a.health > 0) {
        species[a.species] = (species[a.species] || 0) + 1
      }
    })
    console.log(`Population: `, species)
  }
}

export class Animal {
  constructor(species, sound, food, health = 10) {
    this.species = species
    this.sound = sound
    this.food = food
    this.maxHealth = health
    this.health = health
    this.nextLevelXP = 10
    this.XP = 0
    this.level = 1
  }


  makeSound() {
    console.log(this.sound)
  }

  eat() {
    this.heal(1, false)
    console.log(`${this.name} ate 1 ${this.food}. Current health: ${this.health}`)
  }

  heal(amount = 1, log = true) {
    if (this.health < this.maxHealth) {
      this.health += amount
      this.health = Math.min(this.health, this.maxHealth)
      if (log) {
        console.log(`${this.name} healed for ${amount} health.`)
      }
    } else {
      if (log) {
        console.log(`${this.name} (${this.species}) is already at max health. Does nothing.`)
      }
    }
  }

  attack(otherAnimal, damage = 5, log = true) {
    if (log) {
      console.log(`${this?.name || this.species} attacked ${otherAnimal?.name || otherAnimal.species} for ${damage} damage`)
    }
    const damageGiven = damage * (this.level)
    otherAnimal.takeDamage(damageGiven)
    if (otherAnimal?.health <= 0) {
      const XPGained = otherAnimal?.level * 2
      this.gainXP(XPGained)
    }
  }

  takeDamage(damage) {
    this.health -= damage
    if (this.health < 1) {
      console.log(`${this?.name || this.species} took damage, health reduced to zero. ${this?.name || this.species} has died`)
    } else {
      console.log(`${this?.name || this.species} took ${damage} damage. Current health: ${this.health}`)
    }
  }

  gainXP(XP, log = true) {
    if (isNaN(XP) || XP < 1) return null
    if (log) {
      console.log(`${this.name} (${this.species}) gained ${XP} XP!`)
    }
    this.XP += XP
    if (this.XP >= this.nextLevelXP) {
      this.levelUp()
    }
  }

  levelUp() {
    console.log(`${this.name} (${this.species}) has leveled up!`)
    this.level += 1
    const nextLevelNeeded = this.nextLevelXP * 2
    this.nextLevelXP = nextLevelNeeded
  }
}

export class Dog extends Animal {
  constructor(name) {
    super("Dog", "Bark!", "Kibble", 20)
    this.name = name
  }

  breedWith(other) {
    if (!(other instanceof Dog)) return null

    const childName = getChildName(this.name, other.name)
    const childHealth = Math.floor((this.health + other.health) / 2)

    console.log(`${this.name} and ${other.name} had puppies!`)

    const puppy = new Dog(childName)
    puppy.health = childHealth
    return puppy
  }

  findBone() {
    if (this.health < this.maxHealth) {
      this.heal(5, false)
      console.log(`${this.name} found a bone! Plus 5 health! Current health: ${this.health}`)
    } else {
      console.log(`${this.name} found a bone! Plus 2 XP! Current XP: ${this.XP}`)
      this.gainXP(2, false)
    }
  }

  bite(otherAnimal) {
    console.log(`${this?.name || this.species} bit ${otherAnimal?.name || otherAnimal.species}, inflicting ${7} damage`)
    this.attack(otherAnimal, 7, false)
  }

}

export class Cat extends Animal {
  constructor(name) {
    super("Cat", "Meow!", "Tuna", 20)
    this.name = name
  }

  breedWith(other) {
    if (!(other instanceof Cat)) return null

    const childName = getChildName(this.name, other.name)
    const childHealth = Math.floor((this.health + other.health) / 2)

    console.log(`${this.name} and ${other.name} had kittens!`)

    const kitten = new Cat(childName)
    kitten.health = childHealth
    return kitten
  }

  sleep() {
    if (this.health < this.maxHealth) {
      this.heal(8, false)
      console.log(`${this.name} found a nice spot to cuddle up! Plus 8 health! Current health: ${this.health}`)
    } else {
      console.log(`${this.name} found a nice spot to cuddle up! Plus 3 XP! Current XP: ${this.XP}`)
      this.gainXP(3, false)
    }
  }

  scratch(otherAnimal) {
    console.log(`${this?.name || this.species} scratched ${otherAnimal?.name || otherAnimal.species}, inflicting ${6} damage`)
    this.attack(otherAnimal, 6, false)
  }
}

export class Cow extends Animal {
  constructor(name) {
    super("Cow", "Mooo!", "Hay", 20)
    this.name = name
  }

  breedWith(other) {
    if (!(other instanceof Cow)) return null

    const childName = getChildName(this.name, other.name)
    const childHealth = Math.floor((this.health + other.health) / 2)

    console.log(`${this.name} and ${other.name} had a calf!`)

    const calf = new Cow(childName)
    calf.health = childHealth
    return calf
  }

  chewCud() {
    if (this.health < this.maxHealth) {
      this.heal(4, false)
      console.log(`${this.name} found grass and chewed some cud! Plus 4 health! Current health: ${this.health}`)
    } else {
      console.log(`${this.name} found grass and chewed some cud! Plus 1 XP! Current XP: ${this.XP}`)
      this.gainXP(1, false)
    }
  }

  charge(otherAnimal) {
    console.log(`${this?.name || this.species} charged ${otherAnimal?.name || otherAnimal.species}, inflicting ${10} damage`)
    this.attack(otherAnimal, 10, false)
  }
}

export class Falcon extends Animal {
  constructor(name) {
    super("Falcon", "Caw!", "Mouse", 20)
    this.name = name
  }

  breedWith(other) {
    if (!(other instanceof Falcon)) return null

    const childName = getChildName(this.name, other.name)
    const childHealth = Math.floor((this.health + other.health) / 2)

    console.log(`${this.name} and ${other.name} had chicks!`)

    const chick = new Falcon(childName)
    chick.health = childHealth
    return chick
  }

  findWorm() {
    if (this.health < this.maxHealth) {
      this.heal(5, false)
      console.log(`${this.name} found a worm to eat! Plus 5 health! Current health: ${this.health}`)
    } else {
      console.log(`${this.name} found a worm to eat! Plus 5 XP! Current XP: ${this.XP}`)
      this.gainXP(5, false)
    }
  }

  aerialAttack(otherAnimal) {
    console.log(`${this?.name || this.species} attack dove on ${otherAnimal?.name || otherAnimal.species}, inflicting ${7} damage`)
    this.attack(otherAnimal, 7, false)
  }
}

export class Lizard extends Animal {
  constructor(name) {
    super("Lizard", "Blep...", "Bug", 20)
    this.name = name
  }

  breedWith(other) {
    if (!(other instanceof Lizard)) return null

    const childName = getChildName(this.name, other.name)
    const childHealth = Math.floor((this.health + other.health) / 2)

    console.log(`${this.name} and ${other.name} had lizard babies!`)

    const lizardBaby = new Lizard(childName)
    lizardBaby.health = childHealth
    return lizardBaby
  }

  eatBug() {
    if (this.health < this.maxHealth) {
      this.heal(3, false)
      console.log(`${this.name} found a bug to eat! Plus 3 health! Current health: ${this.health}`)
    } else {
      console.log(`${this.name} found a bug to eat! Plus 3 XP! Current XP: ${this.XP}`)
      this.gainXP(3, false)
    }
  }

  camoflaugeAttack(otherAnimal) {
    console.log(`${this?.name || this.species} attacked ${otherAnimal?.name || otherAnimal.species} while in camoflauge, inflicting ${11} damage`)
    this.attack(otherAnimal, 11, false)
  }
}

const world = new World()
world.addAnimal(new Dog("Fido"))
world.addAnimal(new Dog("Bella"))
world.addAnimal(new Cat("Winston"))
world.addAnimal(new Cat("Mandu"))
world.addAnimal(new Cow("Robert"))
world.addAnimal(new Cow("Betsy"))
world.addAnimal(new Falcon("Scretch"))
world.addAnimal(new Falcon("Razeala"))
world.addAnimal(new Lizard("Gleck"))
world.addAnimal(new Lizard("Zazel"))

const shell = new Shell(world)
shell.start()
