class Animal {
  constructor(species, sound, food, health = 10) {
    this.species = species
    this.sound = sound
    this.food = food
    this.position = [0, 0]
    this.maxHealth = health
    this.health = health
  }

  makeSound() {
    console.log(this.sound)
  }

  eat() {
    if (this.health < this.maxHealth) {
      this.health += 1
      console.log(`${this.name} ate 1 ${this.food}. Current health: ${this.health}`)
    } else {
      console.log(`${this.name} is already at max health: ${this.health}`)
    }
  }

  move() {
    this.position = [this.position[0] + 1, this.position[1]]
    console.log(`${this.species} moved. New coordinates: [${this.position}]`)
  }

  takeDamage(damage) {
    this.health -= damage
    if (this.health < 1) {
      console.log(`Damage taken, health reduced to zero. ${this.species} has died`)
    } else {
      console.log(`${damage} damage taken. Current health: ${this.health}`)
    }
  }
}

class Dog extends Animal {
  constructor(name) {
    super("Dog", "Bark!", "Kibble", 20)
    this.name = name
  }

  leap() {
    this.position = [this.position[0] + 2, this.position[1]]
    console.log(`${this.name} (${this.species}) leaped. New coordinates: [${this.position}]`)
  }

  devour() {
    if (this.health < this.maxHealth) {
      this.health += 5
      if (this.health > this.maxHealth) {
        this.health = this.maxHealth
      }
      console.log(`${this.name} devoured ${this.food}. Current health: ${this.health}`)
    } else {
      console.log(`${this.name} is already at max health: ${this.health}`)
    }
  }
}


const Fido = new Dog("Fido")

Fido.makeSound()
Fido.leap()
Fido.takeDamage(10)
Fido.takeDamage(10)
Fido.eat()
Fido.devour()
Fido.devour()
Fido.makeSound()
Fido.move()
