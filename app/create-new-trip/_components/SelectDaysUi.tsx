import React, { useState } from 'react'
function SelectDays({ onSelectedOption }: any) {
    const [days, setDays] = useState(3)
    return (
        <div className="flex flex-col items-center mt-2 p-4 border rounded-2xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">How many days do you want to travel?</h2>
            <div className="flex items-center gap-4 my-2">
                <button
                    className="w-10 h-10 flex items-center justify-center text-xl border border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                    onClick={() => setDays(prev => (prev > 1 ? prev - 1 : 1))}
                >➖</button>
                <span className="text-2xl font-bold text-gray-900 dark:text-white w-20 text-center">{days} Days</span>
                <button
                    className="w-10 h-10 flex items-center justify-center text-xl border border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                    onClick={() => setDays(prev => prev + 1)}
                >➕</button>
            </div>
            <button
                className="mt-3 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                onClick={() => onSelectedOption(`${days} Days`)}
            >
                Confirm
            </button>
        </div>
    )
}
export default SelectDays

