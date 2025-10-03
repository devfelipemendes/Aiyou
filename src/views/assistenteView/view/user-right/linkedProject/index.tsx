// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports

import ProjectCard from '@/components/ProjectCardDetails/ProjectCardDetails'
import type { GetSingleAssistantResponse } from '@/api/endpoints/assistant/assistant'

const LinkedProject = ({ data }: { data: GetSingleAssistantResponse | undefined }) => {
  return (
    <Grid container spacing={6}>
      <ProjectCard data={data} />
    </Grid>
  )
}

export default LinkedProject
