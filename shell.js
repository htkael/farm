import readline from "readline"
import { clearInterval } from "timers"
import { AnimalMap, getAllMethods } from "./helpers.js"

class Shell {
  constructor(world) {
    this.world = world
    this.simulationInterval = null
    this.isRunning = false
    this.logBuffer = []

    this.originalLog = console.log
    console.log = (...args) => {
      this.customLog(...args)
    }

    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: '> '
    })

    this.setUpListeners()
  }

  customLog(...args) {
    const message = args.map(arg =>
      typeof args === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(" ")

    this.rl.output.write(message + '\n')

    this.logBuffer.push(message)
    if (this.logBuffer.length > 100) {
      this.logBuffer.shift()
    }
  }

  setUpListeners() {
    this.rl.on('line', (input) => {
      this.handleCommand(input.trim())
      if (this.isRunning) {

      } else {
        this.rl.prompt()
      }
    })

    this.rl.on('close', () => {
      console.log('\nGoodbye!')
      process.exit(0)
    })
  }

  handleCommand(command) {
    const [cmd, ...args] = command.toLowerCase().split(' ')

    switch (cmd) {
      case 'start':
        this.startSimulation(args[0])
        break
      case 'stop':
        this.stopSimulation()
        break
      case 'status':
        this.showStatus()
        break
      case 'pop':
        this.world.logPopulation()
        break
      case 'add':
        this.addAnimal(args)
        break
      case 'list':
        this.listAnimals()
        break
      case 'help':
        this.showHelp()
        break
      case 'clear':
        console.clear()
        break
      case 'exit':
      case 'quit':
        this.rl.close()
        break
      default:
        if (command) {
          console.log(`Unknown command: ${command}. Type 'help' for available commands`)
        }
    }
  }

  startSimulation(speed = '2000') {
    if (this.isRunning) {
      console.log("Simulation is already running!")
      return
    }

    const interval = parseInt(speed)

    if (isNaN(interval)) {
      console.log("Invalid speed. Usage: start [milliseconds]")
      return
    }

    console.log(`Starting simulation... (speed: ${interval}ms)`)
    this.isRunning = true
    console.log("world initiated", { world: this.world })
    this.simulationInterval = setInterval(() => {
      this.world.randomInteraction()
    }, interval)
  }

  stopSimulation() {
    if (!this.isRunning) {
      console.log("Simulation is not running.")
      return
    }

    this.isRunning = false
    clearInterval(this.simulationInterval)
    this.rl.prompt()
  }

  showStatus() {
    console.log(`Simulation: ${this.isRunning ? 'RUNNING' : 'STOPPED'}`)
    console.log(`Total animals: ${this.world.animals.length}`)
    console.log(`Alive animals: ${this.world.animals.filter(a => a.health > 0).length}`)
    console.log(`Dead animals: ${this.world.animals.filter(a => a.health <= 0).length}`)
  }

  listAnimals() {
    console.log(`\n=== ANIMALS ===`)
    this.world.animals.forEach((animal, i) => {
      const status = animal.health > 0 ? '✓' : '✗'
      const methods = getAllMethods(animal)?.filter(m => m !== 'constructor')
      console.log(`${i}. ${status} ${animal.name || animal.species} (${animal.name ? animal.species : ""}) - HP: ${animal.health}/${animal.maxHealth} - XP: ${animal.XP}/${animal.nextLevelXP}`)
      console.log(`   Abilities: ${methods.join(", ")}`)
    })
    console.log("")
  }

  addAnimal(args) {
    const [type, name] = args

    if (!type || !name) {
      console.log("Usage: add <type> <name>")
      console.log("Example: add dog Fido")
      return
    }

    console.log(`Adding ${type} named ${name}...`)

    const lowerType = type.toLowerCase().trim()

    const newAnimal = AnimalMap[lowerType](name)

    this.world.addAnimal(newAnimal)
  }

  showHelp() {
    console.log(`
=== AVAILABLE COMMANDS ===
start [speed]     - Start simulation (default: 2000ms)
stop              - Stop simulation
status            - Show simulation status
pop/population    - Show population breakdown
list              - List all animals and their abilities
add <type> <name> - Add a new animal
clear             - Clear console
help              - Show this help message
exit/quit         - Exit the program

Examples:
  start 1000      - Start simulation with 1 second intervals
  add dog Rex     - Add a dog named Rex
  pop             - Show population by species
    `)
  }

  start() {
    console.log(`=== ANIMAL SIMULATION ===`)
    console.log(`Type "help" for available commands`)
    this.rl.prompt()
  }
}


export default Shell
