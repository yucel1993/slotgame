"use client"

import React from "react"

const { useState, useCallback, useRef } = React
const { motion, AnimatePresence } = framerMotion
import ReactDOM from "react-dom/client"

// Fruit symbols for the slot machine with Joker
const fruits = ["🍎", "🍌", "🍊", "🥒", "🃏"]

// Generate a long sequence of random fruits for the spinning effect
const generateSpinSequence = () => {
  return Array(20)
    .fill(0)
    .map(() => {
      const random = Math.random()
      if (random < 0.1) {
        return "🃏"
      }
      return fruits[Math.floor(random * (fruits.length - 1))]
    })
}

// Generate random stars for the winning animation
const generateStars = (count) => {
  return Array(count)
    .fill(0)
    .map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 1 + Math.random() * 0.5,
    }))
}

function SlotMachine() {
  const [reels, setReels] = useState([
    generateSpinSequence().slice(0, 4),
    generateSpinSequence().slice(0, 4),
    generateSpinSequence().slice(0, 4),
    generateSpinSequence().slice(0, 4),
  ])
  const [spinning, setSpinning] = useState(false)
  const [win, setWin] = useState(false)
  const [winningFruit, setWinningFruit] = useState(null)
  const [jokerWin, setJokerWin] = useState(false)
  const [winLine, setWinLine] = useState(null)
  const [winningPositions, setWinningPositions] = useState([])
  const [credits, setCredits] = useState(100)
  const [spinSequences, setSpinSequences] = useState([
    generateSpinSequence(),
    generateSpinSequence(),
    generateSpinSequence(),
    generateSpinSequence(),
  ])
  const [stars] = useState(() => generateStars(15))

  // Check for win conditions
  const checkWin = useCallback((newReels) => {
    // Helper function to check if array has matching fruits or joker combination
    const hasMatch = (fruits, positions) => {
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
      // Rows
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
      // Diagonals
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
  const isWinningPosition = (reelIndex, symbolIndex) => {
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

    const newSpinSequences = [
      generateSpinSequence(),
      generateSpinSequence(),
      generateSpinSequence(),
      generateSpinSequence(),
    ]
    setSpinSequences(newSpinSequences)

    const finalReels = newSpinSequences.map((seq) => seq.slice(0, 4))

    setTimeout(() => {
      setReels(finalReels)
      setSpinning(false)
      checkWin(finalReels)
    }, 3000)
  }, [spinning, credits, checkWin])

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
    <div className="container">
      <div className="card">
        <div className="header">
          <h1 className="title">Fruit Slot Machine</h1>
          <motion.div
            className="credits"
            animate={{ scale: credits > 0 ? [1, 1.1, 1] : 1 }}
            transition={{ duration: 0.3 }}
          >
            Credits: <span>{credits}</span>
          </motion.div>
        </div>

        <AnimatePresence>
          {win && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="win-banner"
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
                      ⭐
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

        <div className="slot-display">
          <div className="reels">
            {reels.map((reel, reelIndex) => (
              <div key={reelIndex} className="reel">
                <motion.div
                  className="symbols"
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
                  {(spinning ? spinSequences[reelIndex] : reel).map((fruit, idx) => (
                    <motion.div
                      key={idx}
                      className={`symbol ${fruit === "🃏" ? "joker" : ""}`}
                      style={{
                        filter: spinning ? "blur(1px)" : "none",
                      }}
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
                          className="winning-highlight"
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

          <div className="win-line">
            <div className={getWinLineStyle()}>
              <motion.div
                className={`win-line-indicator ${win ? "winning" : ""}`}
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

        <div className="controls">
          <button onClick={addCredits} className="button button-add">
            Add Credits
          </button>

          <div style={{ display: "flex", alignItems: "center" }}>
            <button onClick={spin} disabled={spinning || credits < 10} className="button button-spin">
              {spinning ? "..." : "SPIN"}
            </button>

            <motion.div
              className="lever"
              animate={{
                rotateZ: spinning ? [0, 45, 0] : 0,
              }}
              transition={{
                duration: 0.5,
                ease: "easeInOut",
              }}
            >
              <div className="lever-handle" />
            </motion.div>
          </div>
        </div>
      </div>

      <div className="info">
        <p>Win conditions:</p>
        <ul>
          <li>Get four matching fruits in any row</li>
          <li>Get four matching fruits diagonally</li>
          <li>Or get three matching fruits + Joker 🃏 in any winning line</li>
          <li>Or get two matching fruits + two Jokers 🃏 in any winning line</li>
        </ul>
        <p>Each spin costs 10 credits. Win 50 credits!</p>
      </div>
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById("root"))
root.render(<SlotMachine />)
