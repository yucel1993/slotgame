"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { Star } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

// Fruit symbols for the slot machine with Joker
const fruits = ["🍎", "🍌", "🍊", "🥒", "🍇", "🃏"]

// Generate a long sequence of random fruits for the spinning effect
const generateSpinSequence = () => {
  return Array(20)
    .fill(0)
    .map(() => {
      const random = Math.random()
      if (random < 0.1) {
        return "🃏"
      }
      // Use fruits.length - 2 to exclude the joker from regular selection
      return fruits[Math.floor(random * (fruits.length - 2))]
    })
}

// Generate random stars for the winning animation
const generateStars = (count: number) => {
  return Array(count)
    .fill(0)
    .map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 1 + Math.random() * 0.5,
    }))
}

export default function SlotMachine() {
  const [reels, setReels] = useState([
    generateSpinSequence().slice(0, 4), // Now showing 4 symbols per reel
    generateSpinSequence().slice(0, 4),
    generateSpinSequence().slice(0, 4),
    generateSpinSequence().slice(0, 4), // Added 4th reel
  ])
  const [spinning, setSpinning] = useState(false)
  const [win, setWin] = useState(false)
  const [winningFruit, setWinningFruit] = useState<string | null>(null)
  const [jokerWin, setJokerWin] = useState(false)
  const [winLine, setWinLine] = useState<string | null>(null)
  const [winningPositions, setWinningPositions] = useState<[number, number][]>([])
  const [credits, setCredits] = useState(100)
  const [spinSequences, setSpinSequences] = useState([
    generateSpinSequence(),
    generateSpinSequence(),
    generateSpinSequence(),
    generateSpinSequence(), // Added 4th sequence
  ])
  const [stars] = useState(() => generateStars(15))

  // Check for win conditions
  const checkWin = useCallback((newReels) => {
    // Helper function to check if array has matching fruits or joker combination
    const hasMatch = (fruits: string[], positions: [number, number][]) => {
      const jokerCount = fruits.filter((f) => f === "🃏").length
      const nonJokerFruits = fruits.filter((f) => f !== "🃏")

      // All same fruits
      if (fruits.every((f) => f === fruits[0])) {
        return { isWin: true, fruit: fruits[0], isJoker: false, positions }
      }

      // Three matching + joker or two matching + two jokers
      if (
        (jokerCount === 1 && nonJokerFruits.length === 3 && nonJokerFruits.every((f) => f === nonJokerFruits[0])) ||
        (jokerCount === 2 && nonJokerFruits.length === 2 && nonJokerFruits[0] === nonJokerFruits[1])
      ) {
        return { isWin: true, fruit: nonJokerFruits[0], isJoker: true, positions }
      }

      return { isWin: false, fruit: null, isJoker: false, positions: [] }
    }

    // Check all possible win lines
    const winLines = [
      // Rows (now 4 rows)
      {
        line: [newReels[0][0], newReels[1][0], newReels[2][0], newReels[3][0]],
        name: "top",
        positions: [
          [0, 0],
          [1, 0],
          [2, 0],
          [3, 0],
        ],
      },
      {
        line: [newReels[0][1], newReels[1][1], newReels[2][1], newReels[3][1]],
        name: "upper-middle",
        positions: [
          [0, 1],
          [1, 1],
          [2, 1],
          [3, 1],
        ],
      },
      {
        line: [newReels[0][2], newReels[1][2], newReels[2][2], newReels[3][2]],
        name: "lower-middle",
        positions: [
          [0, 2],
          [1, 2],
          [2, 2],
          [3, 2],
        ],
      },
      {
        line: [newReels[0][3], newReels[1][3], newReels[2][3], newReels[3][3]],
        name: "bottom",
        positions: [
          [0, 3],
          [1, 3],
          [2, 3],
          [3, 3],
        ],
      },
      // Diagonals (now longer)
      {
        line: [newReels[0][0], newReels[1][1], newReels[2][2], newReels[3][3]],
        name: "diagonal1",
        positions: [
          [0, 0],
          [1, 1],
          [2, 2],
          [3, 3],
        ],
      },
      {
        line: [newReels[0][3], newReels[1][2], newReels[2][1], newReels[3][0]],
        name: "diagonal2",
        positions: [
          [0, 3],
          [1, 2],
          [2, 1],
          [3, 0],
        ],
      },
    ]

    // Check each line for wins
    for (const { line, name, positions } of winLines) {
      const result = hasMatch(line, positions)
      if (result.isWin) {
        setWin(true)
        setWinningFruit(result.fruit)
        setJokerWin(result.isJoker)
        setWinLine(name)
        setWinningPositions(result.positions)

        setTimeout(() => {
          setCredits((prev) => prev + 50)
        }, 500)
        return true
      }
    }

    setWin(false)
    setJokerWin(false)
    setWinningFruit(null)
    setWinLine(null)
    setWinningPositions([])
    return false
  }, [])

  // Check if a position is part of the winning combination
  const isWinningPosition = (reelIndex: number, symbolIndex: number) => {
    return winningPositions.some(([r, s]) => r === reelIndex && s === symbolIndex)
  }

  // Spin the reels
  const spin = useCallback(() => {
    if (spinning || credits < 10) return

    setCredits((prev) => prev - 10)
    setWin(false)
    setJokerWin(false)
    setWinningFruit(null)
    setWinLine(null)
    setWinningPositions([])
    setSpinning(true)

    // Generate the final result first
    const finalReels = [
      Array(4)
        .fill(0)
        .map(() => {
          const random = Math.random()
          if (random < 0.1) return "🃏"
          return fruits[Math.floor(random * (fruits.length - 2))]
        }),
      Array(4)
        .fill(0)
        .map(() => {
          const random = Math.random()
          if (random < 0.1) return "🃏"
          return fruits[Math.floor(random * (fruits.length - 2))]
        }),
      Array(4)
        .fill(0)
        .map(() => {
          const random = Math.random()
          if (random < 0.1) return "🃏"
          return fruits[Math.floor(random * (fruits.length - 2))]
        }),
      Array(4)
        .fill(0)
        .map(() => {
          const random = Math.random()
          if (random < 0.1) return "🃏"
          return fruits[Math.floor(random * (fruits.length - 2))]
        }),
    ]

    // Create spin sequences that end with the final result
    const newSpinSequences = finalReels.map((reel) => {
      // Generate a sequence of random symbols
      const sequence = Array(16)
        .fill(0)
        .map(() => {
          const random = Math.random()
          if (random < 0.1) return "🃏"
          return fruits[Math.floor(random * (fruits.length - 2))]
        })
      // Append the final reel symbols to ensure they appear at the end
      return [...sequence, ...reel]
    })

    setSpinSequences(newSpinSequences)

    setTimeout(() => {
      setReels(finalReels)
      setSpinning(false)
      checkWin(finalReels)
    }, 3000)
  }, [spinning, credits, checkWin, fruits])

  // Add more credits
  const addCredits = () => {
    setCredits((prev) => prev + 100)
  }

  // Get win line position for highlighting
  const getWinLineStyle = () => {
    switch (winLine) {
      case "top":
        return "-mt-[242px] mb-[240px]"
      case "upper-middle":
        return "-mt-[162px] mb-[160px]"
      case "lower-middle":
        return "-mt-[82px] mb-[80px]"
      case "bottom":
        return "-mt-[2px] mb-[0px]"
      case "diagonal1":
        return "-mt-[122px] mb-[120px] [transform:rotate(-45deg)_translateY(50%)_scale(1.6)] origin-center"
      case "diagonal2":
        return "-mt-[122px] mb-[120px] [transform:rotate(45deg)_translateY(50%)_scale(1.6)] origin-center"
      default:
        return "-mt-[122px] mb-[120px]"
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-400 to-blue-600 dark:from-blue-800 dark:to-blue-950 p-4 transition-colors duration-300">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="absolute top-14 right-4 mt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const html = document.documentElement
            const currentTheme = html.classList.contains("dark") ? "light" : "dark"
            if (currentTheme === "dark") {
              html.classList.add("dark")
              localStorage.setItem("theme", "dark")
            } else {
              html.classList.remove("dark")
              localStorage.setItem("theme", "light")
            }
          }}
          className="bg-white/10 border-white/20 hover:bg-white/20 text-white"
        >
          Toggle Light/Dark
        </Button>
      </div>

      <Card className="w-full max-w-2xl bg-yellow-800 dark:bg-yellow-900 border-4 border-yellow-600 dark:border-yellow-700 rounded-xl shadow-2xl overflow-hidden">
        <div className="bg-yellow-700 dark:bg-yellow-800 p-3 text-center border-b-4 border-yellow-600 dark:border-yellow-700">
          <h1 className="text-2xl font-bold text-yellow-100">Fruit Slot Machine</h1>
          <motion.div
            className="text-yellow-100 font-bold mt-1"
            animate={{ scale: credits > 0 ? [1, 1.1, 1] : 1 }}
            transition={{ duration: 0.3 }}
          >
            Credits: <span className="text-white">{credits}</span>
          </motion.div>
        </div>

        {/* Win display */}
        <AnimatePresence>
          {win && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-green-600 dark:bg-green-700 text-white text-center py-2 font-bold overflow-hidden"
            >
              <div className="relative">
                <div className="absolute inset-0 overflow-hidden">
                  {stars.map((star) => (
                    <motion.div
                      key={star.id}
                      initial={{ y: -20, x: `${star.x}%`, opacity: 1 }}
                      animate={{ y: 100, opacity: 0 }}
                      transition={{
                        duration: star.duration,
                        delay: star.delay,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "linear",
                      }}
                      className="absolute"
                    >
                      <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                    </motion.div>
                  ))}
                </div>
                <span>
                  🎉 WINNER! {jokerWin ? `Three ${winningFruit}s + Joker` : `Four ${winningFruit}s`} on {winLine} line!
                  +50 CREDITS 🎉
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Slot display */}
        <div className="bg-black p-4">
          <div className="grid grid-cols-4 gap-2 mb-4">
            {reels.map((reel, reelIndex) => (
              <div key={reelIndex} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden h-[320px] relative">
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/20 z-10" />
                <motion.div
                  className="flex flex-col"
                  animate={{
                    y: spinning ? [-320, 0] : 0,
                  }}
                  transition={{
                    duration: spinning ? 0.5 : 0,
                    repeat: spinning ? Number.POSITIVE_INFINITY : 0,
                    ease: "linear",
                    delay: reelIndex * 0.1,
                  }}
                >
                  {spinning
                    ? spinSequences[reelIndex].map((fruit, idx) => (
                        <motion.div
                          key={`spinning-${reelIndex}-${idx}`}
                          className={`h-20 flex items-center justify-center text-4xl border-b border-gray-200 dark:border-gray-700 ${
                            fruit === "🃏"
                              ? "bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900"
                              : ""
                          }`}
                          style={{
                            filter: spinning ? "blur(1px)" : "none",
                          }}
                        >
                          {fruit}
                        </motion.div>
                      ))
                    : reel.map((fruit, idx) => (
                        <motion.div
                          key={`static-${reelIndex}-${idx}`}
                          className={`relative h-20 flex items-center justify-center text-4xl border-b border-gray-200 dark:border-gray-700 ${
                            fruit === "🃏"
                              ? "bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900"
                              : ""
                          }`}
                          initial={spinning ? { y: -20 } : false}
                          animate={{ y: 0 }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 20,
                          }}
                        >
                          {isWinningPosition(reelIndex, idx) && (
                            <motion.div
                              className="absolute inset-0 bg-green-500 dark:bg-green-600"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: [0, 0.2, 0] }}
                              transition={{
                                duration: 1,
                                repeat: Number.POSITIVE_INFINITY,
                                ease: "easeInOut",
                              }}
                            />
                          )}
                          {fruit}
                        </motion.div>
                      ))}
                </motion.div>
              </div>
            ))}
          </div>

          {/* Win line indicator */}
          <div className="relative h-2 z-10">
            <div className={getWinLineStyle()}>
              <motion.div
                className={`h-full ${win ? "bg-green-500 dark:bg-green-600" : "bg-red-500 dark:bg-red-600"} opacity-70`}
                animate={{
                  opacity: win ? [0.7, 1, 0.7] : 0.7,
                  scale: win ? [1, 1.1, 1] : 1,
                }}
                transition={{
                  duration: 0.5,
                  repeat: win ? Number.POSITIVE_INFINITY : 0,
                }}
              />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="p-4 bg-yellow-700 dark:bg-yellow-800 flex justify-between items-center">
          <div>
            <Button
              onClick={addCredits}
              className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white"
            >
              Add Credits
            </Button>
          </div>

          <div className="flex items-center">
            <Button
              onClick={spin}
              disabled={spinning || credits < 10}
              className={`relative h-16 w-16 rounded-full ${
                spinning || credits < 10
                  ? "bg-gray-500 dark:bg-gray-600"
                  : "bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
              } text-white shadow-lg transform transition-transform active:scale-95`}
            >
              <div className="absolute inset-0 flex items-center justify-center">{spinning ? "..." : "SPIN"}</div>
            </Button>

            {/* Lever */}
            <motion.div
              className="h-24 w-4 bg-gradient-to-b from-gray-400 to-gray-600 dark:from-gray-500 dark:to-gray-700 rounded-full ml-2"
              animate={{
                rotateZ: spinning ? [0, 45, 0] : 0,
              }}
              transition={{
                duration: 0.5,
                ease: "easeInOut",
              }}
            >
              <div className="h-6 w-6 rounded-full bg-red-500 dark:bg-red-600 -ml-1" />
            </motion.div>
          </div>
        </div>
      </Card>

      <div className="mt-4 text-white text-center">
        <p>Win conditions:</p>
        <ul className="list-disc list-inside">
          <li>Get four matching fruits in any row</li>
          <li>Get four matching fruits diagonally</li>
          <li>Or get three matching fruits + Joker 🃏 in any winning line</li>
          <li>Or get two matching fruits + two Jokers 🃏 in any winning line</li>
        </ul>
        <p className="text-sm mt-2">Each spin costs 10 credits. Win 50 credits!</p>
        <p className="text-sm mt-1">Fruits: 🍎 🍌 🍊 🥒 🍇 and Joker 🃏</p>
      </div>
    </div>
  )
}
