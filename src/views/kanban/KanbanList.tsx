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
import { alpha, Box, Card, CardContent, styled } from '@mui/material'

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

const StyledKanbanCard = styled(Card)(({ theme }) => ({
  minHeight: '200px',
  backgroundColor: theme.palette.background.paper,
  borderRadius: 12,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'visible',

  // Efeito hover suave
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.15)}`,
    borderColor: alpha(theme.palette.primary.main, 0.25)
  },

  // Efeito quando arrastando
  '&.drag-over': {
    borderColor: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.main, 0.04)
  }
}))

const StyledCardHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 2, 1, 2),
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 100%)`,
  borderRadius: '12px 12px 0 0',
  position: 'relative',

  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    borderRadius: '12px 12px 0 0'
  }
}))

const StyledTasksContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
  minHeight: '120px',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),

  // Custom scrollbar
  maxHeight: '60vh',
  overflowY: 'auto',

  '&::-webkit-scrollbar': {
    width: '6px'
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: alpha(theme.palette.action.hover, 0.1),
    borderRadius: '3px'
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: alpha(theme.palette.action.disabled, 0.5),
    borderRadius: '3px',
    '&:hover': {
      backgroundColor: alpha(theme.palette.action.disabled, 0.8)
    }
  }
}))

const KanbanList = (props: KanbanListProps) => {
  // Props
  const { column, tasks, dispatch, store, setDrawerOpen, columns, setColumns, currentTask } = props

  // States
  const [editDisplay, setEditDisplay] = useState(false)
  const [title, setTitle] = useState(column.title)

  // Hooks
  const [tasksListRef, tasksList, setTasksList] = useDragAndDrop(tasks, {
    group: 'tasksList',
    plugins: [animations()],
    draggable: el => el.classList.contains('item-draggable')
  })

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

  // Update column taskIds on drag and drop
  useEffect(() => {
    if (tasksList !== tasks) {
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
    <StyledKanbanCard ref={tasksListRef as RefObject<HTMLDivElement>} className='is-[16.5rem]'>
      <StyledCardHeader>
        {editDisplay ? (
          <form
            className='flex items-center'
            onSubmit={handleSubmitEdit}
            onKeyDown={e => {
              if (e.key === 'Escape') {
                cancelEdit()
              }
            }}
          >
            <InputBase
              value={title}
              autoFocus
              onChange={e => setTitle(e.target.value)}
              required
              sx={{
                fontSize: '1.1rem',
                fontWeight: 600,
                flex: 1
              }}
            />
            <IconButton color='success' size='small' type='submit'>
              <i className='ri-check-line' />
            </IconButton>
            <IconButton color='error' size='small' type='reset' onClick={cancelEdit}>
              <i className='ri-close-line' />
            </IconButton>
          </form>
        ) : (
          <div id='no-drag' className={classnames('flex items-center justify-between w-full', styles.kanbanColumn)}>
            <Typography
              variant='h6'
              noWrap
              className='max-is-[80%]'
              sx={{
                color: 'primary.main',
                fontWeight: 600,
                fontSize: '1.1rem'
              }}
            >
              {column.title}
            </Typography>
            <Box className='flex items-center gap-1'>
              <Box
                sx={{
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  borderRadius: '50%',
                  width: 20,
                  height: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  mr: 1
                }}
              >
                {tasksList.filter(task => task).length}
              </Box>

              <i className={classnames('ri-drag-move-fill text-textSecondary list-handle', styles.drag)} />
              <OptionMenu
                iconClassName='text-lg text-actionActive'
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
            </Box>
          </div>
        )}
      </StyledCardHeader>

      <StyledTasksContainer>
        {tasksList.map(
          task =>
            task && (
              <TaskCard
                key={task.id}
                task={task}
                dispatch={dispatch}
                column={column}
                setColumns={setColumns}
                columns={columns}
                setDrawerOpen={setDrawerOpen}
                tasksList={tasksList}
                setTasksList={setTasksList}
              />
            )
        )}
      </StyledTasksContainer>

      <CardContent sx={{ pt: 0, pb: 2 }}>
        <NewTask addTask={addNewTask} />
      </CardContent>
    </StyledKanbanCard>
  )
}

export default KanbanList
