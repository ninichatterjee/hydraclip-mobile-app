import { createContext, useContext, useState } from 'react'

interface ReadingIntervalContextType {
  intervalMinutes: number
  setIntervalMinutes: (val: number) => void
}

const ReadingIntervalContext = createContext<ReadingIntervalContextType>({
  intervalMinutes: 20,
  setIntervalMinutes: () => {},
})

export function ReadingIntervalProvider({ children }: { children: React.ReactNode }) {
  const [intervalMinutes, setIntervalMinutes] = useState(20)

  return (
    <ReadingIntervalContext.Provider value={{ intervalMinutes, setIntervalMinutes }}>
      {children}
    </ReadingIntervalContext.Provider>
  )
}

export function useReadingInterval() {
  return useContext(ReadingIntervalContext)
}
