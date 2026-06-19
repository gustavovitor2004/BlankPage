'use client'

import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'

interface SuggestionListProps {
  items: string[]
  command: (props: { label: string }) => void
}

export interface SuggestionListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean
}

const SuggestionList = forwardRef<SuggestionListRef, SuggestionListProps>(
  ({ items, command }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0)

    useEffect(() => {
      setSelectedIndex(0)
    }, [items])

    useImperativeHandle(ref, () => ({
      onKeyDown({ event }) {
        if (event.key === 'ArrowUp') {
          setSelectedIndex(i => (i + items.length - 1) % items.length)
          return true
        }
        if (event.key === 'ArrowDown') {
          setSelectedIndex(i => (i + 1) % items.length)
          return true
        }
        if (event.key === 'Enter') {
          const item = items[selectedIndex]
          if (item) command({ label: item })
          return true
        }
        return false
      },
    }))

    if (items.length === 0) return null

    return (
      <div className="suggestion-list">
        {items.map((item, index) => (
          <button
            key={item}
            className={`suggestion-item ${index === selectedIndex ? 'is-selected' : ''}`}
            onClick={() => command({ label: item })}
          >
            {item}
          </button>
        ))}
      </div>
    )
  }
)

SuggestionList.displayName = 'SuggestionList'
export default SuggestionList
