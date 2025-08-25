import React from 'react'

import { Box, Button, CardContent, CardHeader } from '@mui/material'
import Grid from '@mui/material/Grid2'

export default function StepCreateEndpoints() {
  return (
    <>
      <Box>
        <CardHeader title='Gerenciar APIs' subheader='Cadastre e gerencie suas APIs externas' />
        <CardContent>
          <Grid container spacing={4}>
            {/* Formulário de Cadastro */}
            <Grid size={{ xs: 12 }}>
              <Box className='flex justify-end'>
                <Button variant='contained' startIcon={<i className='ri-add-line' />} onClick={handleOpenModal}>
                  Cadastrar API
                </Button>
              </Box>
            </Grid>

            {/* Tabela de APIs */}
            {apis.length > 0 && (
              <Grid size={{ xs: 12 }}>
                <ListTable
                  columns={columns}
                  tableData={apis}
                  loading={isLoading}
                  exportFileName='apis-cadastradas'
                  searchInputPlaceholder='Buscar API...'
                  headerTable={
                    <CardHeader title={`APIs Cadastradas (${apis.length})`} subheader='Gerencie suas APIs externas' />
                  }
                  headerHasDivider
                />
              </Grid>
            )}

            {/* Empty State */}
            {apis.length === 0 && !isLoading && (
              <Grid size={{ xs: 12 }}>
                <Box className='text-center py-12'>
                  <i className='ri-api-line text-6xl text-gray-300 mb-4 block' />
                  <Typography variant='h6' className='text-gray-500 mb-2'>
                    Nenhuma API cadastrada
                  </Typography>
                  <Typography className='text-gray-400 mb-4'>
                    Cadastre sua primeira API para começar a integrar com serviços externos
                  </Typography>
                  <Button variant='contained' startIcon={<i className='ri-add-line' />} onClick={handleOpenModal}>
                    Cadastrar primeira API
                  </Button>
                </Box>
              </Grid>
            )}

            {/* Next Step Button */}
            {apis.length > 0 && onNextStep && (
              <Grid size={{ xs: 12 }}>
                <Box className='flex justify-end'>
                  <Button
                    variant='contained'
                    size='large'
                    onClick={onNextStep}
                    endIcon={<i className='ri-arrow-right-line' />}
                  >
                    Próximo Passo
                  </Button>
                </Box>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Box>

      {/* Modal de Cadastro/Edição */}
      <Modal open={isModalOpen} onClose={handleCloseModal}>
        <Box sx={modalStyle}>
          <Typography variant='h6' className='mb-4'>
            {editingApi ? 'Editar API' : 'Cadastrar Nova API'}
          </Typography>

          <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>
            <TextField
              {...form.register('name')}
              label='Nome da API'
              fullWidth
              error={!!form.formState.errors.name}
              helperText={form.formState.errors.name?.message}
            />

            <TextField
              {...form.register('description')}
              label='Descrição'
              fullWidth
              multiline
              rows={3}
              error={!!form.formState.errors.description}
              helperText={form.formState.errors.description?.message}
            />

            <TextField
              {...form.register('url')}
              label='URL da API'
              fullWidth
              placeholder='https://api.exemplo.com'
              error={!!form.formState.errors.url}
              helperText={form.formState.errors.url?.message}
            />

            <TextField
              {...form.register('token')}
              label='Token de Autenticação'
              fullWidth
              type='password'
              error={!!form.formState.errors.token}
              helperText={form.formState.errors.token?.message}
            />

            <Divider />

            <Box className='flex gap-2 justify-end'>
              <Button variant='outlined' onClick={handleCloseModal} disabled={isCreating || isUpdating}>
                Cancelar
              </Button>
              <Button
                type='submit'
                variant='contained'
                disabled={isCreating || isUpdating || !form.formState.isValid}
                startIcon={
                  isCreating || isUpdating ? (
                    <i className='ri-loader-4-line animate-spin' />
                  ) : (
                    <i className='ri-save-line' />
                  )
                }
              >
                {editingApi ? 'Atualizar' : 'Cadastrar'}
              </Button>
            </Box>
          </form>
        </Box>
      </Modal>

      {/* Modal de Confirmação de Delete */}
      <Modal open={!!apiToDelete} onClose={() => setApiToDelete(null)}>
        <Box sx={modalStyle}>
          <Typography variant='h6' className='mb-4'>
            Confirmar Exclusão
          </Typography>

          <Typography className='mb-4'>
            Tem certeza que deseja excluir a API <strong>{apiToDelete?.name}</strong>? Esta ação não pode ser desfeita.
          </Typography>

          <Box className='flex gap-2 justify-end'>
            <Button variant='outlined' onClick={() => setApiToDelete(null)} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button
              variant='contained'
              color='error'
              onClick={handleDeleteApi}
              disabled={isDeleting}
              startIcon={
                isDeleting ? <i className='ri-loader-4-line animate-spin' /> : <i className='ri-delete-bin-line' />
              }
            >
              Excluir
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  )
}
