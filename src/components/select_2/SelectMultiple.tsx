// React Imports
import { useState } from 'react'

// MUI Imports
import Chip from '@mui/material/Chip'
import MenuItem from '@mui/material/MenuItem'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import type { SelectChangeEvent } from '@mui/material/Select'

const ITEM_HEIGHT = 48
const ITEM_PADDING_TOP = 8

const MenuProps = {
  PaperProps: {
    style: {
      width: 250,
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP
    }
  }
}

// Tipos das opções (id + nome para exibir)
export interface Option {
  id: string
  name: string
}

export interface SelectMultipleChipProps {
  label?: string
  options: Option[]
  value?: string[]
  onChange?: (value: string[]) => void
}

const SelectMultipleChip = ({ label = 'Seleção', options, value = [], onChange }: SelectMultipleChipProps) => {
  const [internalValue, setInternalValue] = useState<string[]>(value)

  const handleChange = (event: SelectChangeEvent<string[]>) => {
    const newValue = event.target.value as string[]

    setInternalValue(newValue)
    onChange?.(newValue)
  }

  return (
    <FormControl fullWidth>
      <InputLabel id='multiple-chip-label'>{label}</InputLabel>
      <Select
        multiple
        label={label}
        value={internalValue}
        MenuProps={MenuProps}
        id='multiple-chip'
        onChange={handleChange}
        labelId='multiple-chip-label'
        renderValue={selected => (
          <div className='flex flex-wrap gap-1'>
            {(selected as string[]).map(id => {
              const option = options.find(o => o.id === id)

              return <Chip key={id} label={option?.name ?? id} size='small' />
            })}
          </div>
        )}
      >
        {options.map(option => (
          <MenuItem key={option.id} value={option.id}>
            {option.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

export default SelectMultipleChip
