// React Imports
import { useEffect, useState } from 'react'
import type { FormEvent, RefObject } from 'react'

// MUI Imports
import Typography from '@mui/material/Typography'
import InputBase from '@mui/material/InputBase'
import IconButton from '@mui/material/IconButton'

// Third-party imports
import { useDragAndDrop } from '@formkit/drag-and-drop/react'
import { animations } from '@formkit/drag-and-drop'
import classnames from 'classnames'

// Type Imports
import type { TaskType, ColumnType, KanbanType } from '@/types/kanbanTypes'
import type { AppDispatch } from '@/redux-store'

// Slice Imports
import { addTask, editColumn, deleteColumn, updateColumnTaskIds } from '@/redux-store/slices/kanban'

// Component Imports
import OptionMenu from '@core/components/option-menu'
import TaskCard from './TaskCard'
import NewTask from './NewTask'

// Styles Imports
import styles from './styles.module.css'

type KanbanListProps = {
  column: ColumnType
  tasks: (TaskType | undefined)[]
  dispatch: AppDispatch
  store: KanbanType
  setDrawerOpen: (value: boolean) => void
  columns: ColumnType[]
  setColumns: (value: ColumnType[]) => void
  currentTask: TaskType | undefined
}

const KanbanList = (props: KanbanListProps) => {
  // Props
  const { column, tasks, dispatch, store, setDrawerOpen, columns, setColumns, currentTask } = props

  // States
  const [editDisplay, setEditDisplay] = useState(false)
  const [title, setTitle] = useState(column.title)

  // ✅ CONFIGURAÇÃO SIMPLIFICADA do useDragAndDrop
  const [tasksListRef, tasksList, setTasksList] = useDragAndDrop(
    tasks.filter(task => task !== undefined) as TaskType[], // Remove undefined
    {
      group: 'kanban-tasks', // Nome mais específico
      plugins: [animations()],

      // ✅ REMOVIDA a função draggable - deixa mais permissivo
      // draggable: el => el.classList.contains('item-draggable'),

      // ✅ CONFIGURAÇÕES ADICIONAIS para debug
      sortable: true,
      dragHandle: undefined // Permite arrastar qualquer parte do card
    }
  )

  // ✅ DEBUG: Log quando o component monta
  useEffect(() => {
    console.log('🔧 KanbanList Debug:', {
      columnId: column.id,
      columnTitle: column.title,
      tasksCount: tasks.length,
      filteredTasksCount: tasks.filter(t => t !== undefined).length,
      refConnected: !!tasksListRef.current
    })
  }, [])

  // ✅ DEBUG: Log quando tasksList muda
  useEffect(() => {
    console.log('📋 TasksList changed:', {
      columnId: column.id,
      before: tasks.length,
      after: tasksList.length,
      tasksList: tasksList.map(t => ({ id: t.id, title: t.title }))
    })
  }, [tasksList])

  // Add New Task
  const addNewTask = (title: string) => {
    dispatch(addTask({ columnId: column.id, title: title }))

    setTasksList([...tasksList, { id: store.tasks[store.tasks.length - 1].id + 1, title }])

    const newColumns = columns.map(col => {
      if (col.id === column.id) {
        return { ...col, taskIds: [...col.taskIds, store.tasks[store.tasks.length - 1].id + 1] }
      }

      return col
    })

    setColumns(newColumns)
  }

  // Handle Submit Edit
  const handleSubmitEdit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setEditDisplay(!editDisplay)
    dispatch(editColumn({ id: column.id, title }))

    const newColumn = columns.map(col => {
      if (col.id === column.id) {
        return { ...col, title }
      }

      return col
    })

    setColumns(newColumn)
  }

  // Cancel Edit
  const cancelEdit = () => {
    setEditDisplay(!editDisplay)
    setTitle(column.title)
  }

  // Delete Column
  const handleDeleteColumn = () => {
    dispatch(deleteColumn({ columnId: column.id }))
    setColumns(columns.filter(col => col.id !== column.id))
  }

  // ✅ MELHORADO: Update column taskIds on drag and drop
  useEffect(() => {
    if (tasksList !== tasks.filter(t => t !== undefined)) {
      console.log('🔄 Updating column taskIds:', {
        columnId: column.id,
        newTaskIds: tasksList.map(t => t.id)
      })
      dispatch(updateColumnTaskIds({ id: column.id, tasksList }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasksList])

  // To update the tasksList when a task is edited
  useEffect(() => {
    const newTasks = tasksList.map(task => {
      if (task?.id === currentTask?.id) {
        return currentTask
      }

      return task
    })

    if (currentTask !== tasksList.find(task => task?.id === currentTask?.id)) {
      setTasksList(newTasks)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTask])

  // To update the tasksList when columns are updated
  useEffect(() => {
    let taskIds: ColumnType['taskIds'] = []

    columns.map(col => {
      taskIds = [...taskIds, ...col.taskIds]
    })

    const newTasksList = tasksList.filter(task => task && taskIds.includes(task.id))

    setTasksList(newTasksList)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columns])

  return (
    <div className='flex flex-col is-[16.5rem]'>
      {/* ✅ HEADER DA COLUNA - sem mudanças, já funciona */}
      {editDisplay ? (
        <form
          className='flex items-center mbe-4'
          onSubmit={handleSubmitEdit}
          onKeyDown={e => {
            if (e.key === 'Escape') {
              cancelEdit()
            }
          }}
        >
          <InputBase value={title} autoFocus onChange={e => setTitle(e.target.value)} required />
          <IconButton color='success' size='small' type='submit'>
            <i className='ri-check-line' />
          </IconButton>
          <IconButton color='error' size='small' type='reset' onClick={cancelEdit}>
            <i className='ri-close-line' />
          </IconButton>
        </form>
      ) : (
        <div
          id='no-drag'
          className={classnames(
            'flex items-center justify-between is-[16.5rem] bs-[2.125rem] mbe-4',
            styles.kanbanColumn
          )}
        >
          <Typography variant='h5' noWrap className='max-is-[80%]'>
            {column.title}
          </Typography>
          <div className='flex items-center'>
            <i className={classnames('ri-drag-move-fill text-textSecondary list-handle', styles.drag)} />
            <OptionMenu
              iconClassName='text-xl text-actionActive'
              options={[
                {
                  text: 'Edit',
                  icon: 'ri-pencil-line',
                  menuItemProps: {
                    className: 'flex items-center gap-2',
                    onClick: () => setEditDisplay(!editDisplay)
                  }
                },
                {
                  text: 'Delete',
                  icon: 'ri-delete-bin-line',
                  menuItemProps: { className: 'flex items-center gap-2', onClick: handleDeleteColumn }
                }
              ]}
            />
          </div>
        </div>
      )}

      {/* ✅ CONTAINER DOS CARDS - Aqui está a correção principal */}
      <div
        ref={tasksListRef as RefObject<HTMLDivElement>}
        className='flex flex-col gap-2 min-h-[100px]'
        style={{
          // ✅ GARANTIR que o container está visível e interativo
          minHeight: '100px',
          position: 'relative',
          zIndex: 1
        }}
        data-column-id={column.id}
        data-tasks-count={tasksList.length}
      >
        {tasksList.map(task => (
          <div
            key={task.id}
            className='item-draggable' // ✅ Classe aplicada aqui no wrapper
            data-task-id={task.id}
            style={{
              // ✅ Garantir que cada item está interativo
              position: 'relative',
              zIndex: 2
            }}
          >
            <TaskCard
              task={task}
              dispatch={dispatch}
              column={column}
              setColumns={setColumns}
              columns={columns}
              setDrawerOpen={setDrawerOpen}
              tasksList={tasksList}
              setTasksList={value => setTasksList((value as TaskType[]).filter((t): t is TaskType => t !== undefined))}
            />
          </div>
        ))}

        {/* ✅ DEBUG: Indicador visual quando a lista está vazia */}
        {tasksList.length === 0 && (
          <div
            className='flex items-center justify-center h-20 border-2 border-dashed border-gray-300 rounded text-gray-500'
            style={{ pointerEvents: 'none' }}
          >
            Drop tasks here
          </div>
        )}
      </div>

      <NewTask addTask={addNewTask} />
    </div>
  )
}

export default KanbanList
