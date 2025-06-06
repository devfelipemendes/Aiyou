// Third-party Imports
import classnames from 'classnames'

// Component Imports
import KanbanBoard from '@views/kanban/KanbanBoard'

// Util Imports
import styles from '@views/kanban/styles.module.css'

import { commonLayoutClasses } from '@layouts/utils/layoutClasses'

// Styles Imports

const KanbanPage = () => {
  return (
    <div
      className={classnames(
        commonLayoutClasses.contentHeightFixed,
        styles.scroll,
        'is-full overflow-auto pis-2 -mis-2'
      )}
    >
      <KanbanBoard />
    </div>
  )
}

export default KanbanPage
