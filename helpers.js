import { Cat, Cow, Dog, Falcon, Lizard, } from "./main.js"

export function getChildName(name1, name2) {
  const firstHalf = name1.slice(0, Math.floor(name1.length / 2))
  const lastHalf = name2.slice(Math.floor(name2.length / 2), name2.length)

  return `${firstHalf}${lastHalf}`
}

export function getAllMethods(obj) {
  const methods = new Set()
  let current = obj

  while (current && current !== Object.prototype) {
    Object.getOwnPropertyNames(current).forEach(name => {
      if (typeof obj[name] === 'function') {
        methods.add(name)
      }
    })
    current = Object.getPrototypeOf(current)
  }

  return Array.from(methods)
}

export const AnimalMap = {
  "dog": (name) => {
    console.log("name for new dog", name)
    const newDog = new Dog(name)
    console.log("newDog", newDog)
    return newDog
  },
  "cat": (name) => new Cat(name),
  "cow": (name) => new Cow(name),
  "falcon": (name) => new Falcon(name),
  "lizard": (name) => new Lizard(name),
}
