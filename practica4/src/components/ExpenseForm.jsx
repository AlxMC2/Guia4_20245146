import React, { useContext, useState, useEffect } from 'react'
import { categories } from '../data/categories'
import DatePicker from 'react-date-picker'
import 'react-date-picker/dist/DatePicker.css'
import 'react-calendar/dist/Calendar.css'
import { BudgetDispatchContext, BudgetStateContext } from '../context/BudgetContext'
import ErrorMessage from './ErrorMessage'

export const ExpenseForm = () => {

    const [expense, setExpense] = useState({
        expenseName: "",
        amount: 0,
        category: "",
        date: new Date(),
    })

    const [error, setError] = useState('')

    const dispatch = useContext(BudgetDispatchContext)
    const state = useContext(BudgetStateContext)

    const isEditing = Boolean(state.editingId)

    useEffect(() => {
        if (state.editingId) {
            const editingExpense = state.expenses.find(
                currentExpense => currentExpense.id === state.editingId
            )
            setExpense(editingExpense)
        }
    }, [state.editingId])

    const handleChange = (e) => {
        const { name, value } = e.target
        const isAmountField = name === "amount"

        setExpense({
            ...expense,
            [name]: isAmountField ? Number(value) : value
        })
    }

    const handleChangeDate = (value) => {
        setExpense({
            ...expense,
            date: value
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        if (Object.values(expense).includes('')) {
            setError('Todos los Campos son Obligatorios')
            return
        }

        const totalExpenses = state.expenses.reduce(
            (total, currentExpense) => total + currentExpense.amount,
            0
        )

        const totalWithoutCurrent = isEditing
            ? totalExpenses - state.expenses.find(e => e.id === state.editingId).amount
            : totalExpenses

        if (totalWithoutCurrent + expense.amount > state.budget) {
            setError('El gasto supera el presupuesto disponible')
            return
        }

        setError('')

        if (isEditing) {
            dispatch({
                type: 'update-expense',
                payload: {
                    expense: {
                        id: state.editingId,
                        ...expense
                    }
                }
            })
        } else {
            dispatch({
                type: 'add-expense',
                payload: { expense }
            })
        }

        setExpense({
            expenseName: "",
            amount: 0,
            category: "",
            date: new Date(),
        })
    }

    return (
        <form className="space-y-5" onSubmit={handleSubmit}>

            <legend className="uppercase text-center text-2xl font-black border-b-4 border-blue-500 py-2">
                {isEditing ? "Guardar Cambios" : "Nuevo Gasto"}
            </legend>

            {error && <ErrorMessage>{error}</ErrorMessage>}

            <div className="flex flex-col gap-2">
                <label htmlFor="expenseName" className="text-xl">
                    Nombre Gasto:
                </label>
                <input
                    type="text"
                    id="expenseName"
                    placeholder="Añade el Nombre del gasto"
                    className="bg-slate-100 p-2"
                    name="expenseName"
                    value={expense.expenseName}
                    onChange={handleChange}
                />
            </div>

            <div className="flex flex-col gap-2">
                <label htmlFor="amount" className="text-xl">
                    Cantidad:
                </label>
                <input
                    type="number"
                    id="amount"
                    placeholder="Añade la Cantidad del gasto: ej. 300"
                    className="bg-slate-100 p-2"
                    name="amount"
                    value={expense.amount}
                    onChange={handleChange}
                />
            </div>

            <div className="flex flex-col gap-2">
                <label htmlFor="category" className="text-xl">
                    Categoría:
                </label>
                <select
                    id="category"
                    className="bg-slate-100 p-2"
                    name="category"
                    value={expense.category}
                    onChange={handleChange}
                >
                    <option value=""> -- Seleccione --</option>
                    {categories.map((category) => (
                        <option
                            key={category.id}
                            value={category.id}
                        >
                            {category.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-xl">
                    Fecha Gasto:
                </label>
                <DatePicker
                    className="bg-slate-100 p-2 border-0"
                    value={expense.date}
                    onChange={handleChangeDate}
                />
            </div>

            <input
                type="submit"
                className="bg-blue-600 cursor-pointer w-full p-2 text-white uppercase font-bold rounded-lg"
                value={isEditing ? "Guardar Cambios" : "Registrar Gasto"}
            />

        </form>
    )
}