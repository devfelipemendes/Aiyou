// file: src/views/invoice/preview/PreviewCard.tsx
'use client'

import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid2'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import { Box, Button, IconButton, Tooltip } from '@mui/material'
import { QRCodeSVG } from 'qrcode.react'
import Barcode from 'react-barcode'

import tableStyles from '@core/styles/table.module.css'
import './print.css'
import { useBuildInvoiceQuery } from '@/api/endpoints/invoices/buildInvoice'
import { useCopyToClipboard } from '@/utils/copyToClipbard'
import { usePrintToPDF } from '@/hooks/usePrintToPDFOptions'

const PreviewCard = () => {
  const params = useParams()

  const { isCopied, copyText } = useCopyToClipboard({
    successDuration: 2500,
    customToastMessage: 'Código PIX copiado!',
    onSuccess: text => console.log('PIX copiado:', text.length, 'caracteres'),
    onError: error => console.error('Erro copy PIX:', error)
  })

  const paymentId = params?.id as string

  const {
    data: invoiceResponse,
    isLoading,
    error
  } = useBuildInvoiceQuery(paymentId, {
    skip: !paymentId
  })

  const invoice = invoiceResponse?.data

  const { isGenerating, generatePDF } = usePrintToPDF({
    filename: `fatura_${invoice?.invoiceNumber || 'documento'}.pdf`,
    onSuccess: filename => console.log('PDF gerado:', filename),
    onError: error => console.error('Erro PDF:', error)
  })

  const handleDownloadBoleto = () => {
    generatePDF('previewCard') // ID do elemento que queremos converter
  }

  if (!paymentId) {
    return <Alert severity='error'>ID do pagamento não fornecido na URL</Alert>
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className='flex justify-center items-center py-12'>
          <CircularProgress />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return <Alert severity='error'>Erro ao carregar dados da fatura. Tente novamente.</Alert>
  }

  if (!invoice) {
    return <Alert severity='warning'>Dados da fatura não encontrados</Alert>
  }

  return (
    <Card className='previewCard w-full' id='previewCard'>
      <CardContent className='sm:!p-12'>
        <Grid container spacing={6}>
          <Grid size={{ xs: 12 }}>
            <Box className='flex flex-col gap-6 items-center justify-center'>
              <Box className='flex items-center'>
                <Image src='/images/LogoAiyou/LogoAiyou.svg' alt={''} width={'150'} height={'150'} />
              </Box>
              <Box className='p-6 bg-actionHover rounded w-full'>
                <Box className='flex justify-between gap-y-4 flex-col sm:flex-row'>
                  <Box className='flex flex-col gap-6'>
                    <Box>
                      <Typography color='text.primary'>
                        Emitido por: <strong>{invoice.nomeempresa}</strong>
                      </Typography>
                      <Typography color='text.primary'>Localidade: Brasil</Typography>
                      {invoice.email_aiyou ? (
                        <Link
                          href={`mailto:${invoice.email_aiyou}`}
                          target='_blank'
                          style={{ color: 'inherit', textDecoration: 'none' }}
                        >
                          <Typography color='text.primary'>Email: {invoice.email_aiyou}</Typography>
                        </Link>
                      ) : (
                        <Link
                          href={`mailto:noreply@aiyou.com.br`}
                          target='_blank'
                          style={{ color: 'inherit', textDecoration: 'none' }}
                        >
                          <Typography color='text.primary'> Email: noreply@aiyou.com.br</Typography>
                        </Link>
                      )}
                    </Box>
                  </Box>
                  <Box className='flex flex-col gap-1'>
                    <Typography variant='h5'>{`Nº # ${invoice.invoiceNumber}`}</Typography>
                    <Box className='flex flex-col gap-1'>
                      <Typography color='text.primary'>
                        Vencimento: {new Date(invoice.dueDate).toLocaleDateString('pt-BR')}
                      </Typography>
                      <Typography color='text.primary'>
                        Status: {invoice.status === 'RECEIVED' ? 'PAGO' : 'PENDENTE'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Grid container spacing={6}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box className='flex flex-col gap-4'>
                  <Typography className='font-medium' color='text.primary'>
                    Destinada Para:
                  </Typography>
                  <Box>
                    <Typography>Nome: {invoice.nome}</Typography>
                    <Typography>CPF: {invoice.cpf}</Typography>
                    <Typography>E-mail: {invoice.email}</Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Box className='flex flex-col gap-4'>
                  <Typography className='font-medium' color='text.primary'>
                    Informações de Pagamento:
                  </Typography>
                  <Box>
                    <Box className='flex items-center gap-4'>
                      <Typography className='min-is-[120px]'>Valor Total:</Typography>
                      <Typography>R$ {invoice.planvalue}</Typography>
                    </Box>
                    {invoice.codigoboleto && (
                      <Box className='flex items-center gap-4'>
                        <Typography className='min-is-[120px]'>Cód. Boleto:</Typography>
                        <Typography className='font-mono text-sm'>{invoice.codigoboleto}</Typography>
                      </Box>
                    )}
                    {invoice.barcode && (
                      <Box className='flex items-center gap-4'>
                        <Typography className='min-is-[120px]'>Código Barras:</Typography>
                        <Typography className='font-mono text-sm'>{invoice.barcode}</Typography>
                      </Box>
                    )}
                    {invoice.link && (
                      <Box className='flex items-center gap-4'>
                        <Typography className='min-is-[120px]'>Boleto PDF:</Typography>
                        <Button
                          variant='contained'
                          size='small'
                          onClick={handleDownloadBoleto}
                          disabled={isGenerating}
                          startIcon={
                            isGenerating ? (
                              <i className='ri-loader-4-line animate-spin' />
                            ) : (
                              <i className='ri-download-line' />
                            )
                          }
                        >
                          {isGenerating ? 'Gerando PDF...' : 'Baixar PDF'}
                        </Button>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Box className='overflow-x-auto border rounded'>
              <table className={tableStyles.table}>
                <thead>
                  <tr className='border-be'>
                    <th className='!bg-transparent'>Descrição</th>
                    <th className='!bg-transparent'>Plano</th>
                    <th className='!bg-transparent'>Quantidade</th>
                    <th className='!bg-transparent'>Valor Unitário</th>
                    <th className='!bg-transparent'>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <Typography color='text.primary'>{invoice.description}</Typography>
                    </td>
                    <td>
                      <Typography color='text.primary'>{invoice.plan}</Typography>
                    </td>
                    <td>
                      <Typography color='text.primary'>1</Typography>
                    </td>
                    <td>
                      <Typography color='text.primary'>R$ {invoice.planvalue}</Typography>
                    </td>
                    <td>
                      <Typography color='text.primary'>R$ {invoice.planvalue}</Typography>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Box>
          </Grid>

          {/* SEÇÃO QR CODE E CÓDIGO DE BARRAS */}
          <Grid size={{ xs: 12 }}>
            <Grid container spacing={6}>
              {/* QR CODE PIX */}

              {/* CÓDIGO DE BARRAS BOLETO */}
              {invoice.barcode && (
                <Grid size={{ xs: 12 }}>
                  <Grid container spacing={6} className='justify-center'>
                    <Grid
                      size={{ xs: 12, md: 12, lg: 6, sm: 12, xl: 6 }}
                      className='flex  gap-4 justify-between p-4  rounded '
                    >
                      <Box className='flex flex-col gap-4 items-center'>
                        <Typography variant='h6' className='font-medium' color='text.primary'>
                          PIX - QR Code
                        </Typography>
                        <QRCodeSVG value={invoice.payload} size={150} bgColor='#ffffff' fgColor='#000000' level='L' />
                        <Typography variant='body2' color='text.secondary' className='text-center'>
                          Escaneie o código QR para pagamento via PIX
                        </Typography>
                        <Box className='flex flex-col items-center w-full'>
                          <Box className='flex items-center gap-2 mb-2'>
                            <Typography variant='h6' className='font-medium'>
                              Código Copia e Cola:
                            </Typography>
                            <Tooltip title={isCopied ? 'Copiado!' : 'Copiar código PIX'}>
                              <IconButton
                                onClick={() => copyText(invoice.payload)}
                                size='small'
                                color={isCopied ? 'success' : 'primary'}
                                disabled={isLoading}
                              >
                                {isLoading ? (
                                  <i className='ri-loader-4-line animate-spin' style={{ fontSize: '16px' }} />
                                ) : isCopied ? (
                                  <i className='ri-check-line' style={{ fontSize: '16px' }} />
                                ) : (
                                  <i className='ri-file-copy-line' style={{ fontSize: '16px' }} />
                                )}
                              </IconButton>
                            </Tooltip>
                          </Box>
                          <Box
                            className='w-full max-w-[100%]'
                            sx={{
                              wordBreak: 'break-all',
                              overflowWrap: 'break-word',
                              overflow: 'hidden',
                              lineHeight: 1.2,
                              maxHeight: '80px'
                            }}
                          >
                            <Typography
                              variant='caption'
                              sx={{
                                wordBreak: 'break-all',
                                overflowWrap: 'break-word',
                                textAlign: 'center'
                              }}
                            >
                              {invoice.payload}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid
                      size={{ xs: 12, md: 6, lg: 6, sm: 6, xl: 6 }}
                      className='flex flex-col gap-4 items-center p-4 '
                    >
                      <Typography variant='h6' className='font-medium' color='text.primary'>
                        Boleto - Código de Barras
                      </Typography>
                      <Box className='overflow-x-auto'>
                        <Barcode
                          value={invoice.barcode}
                          format='CODE128'
                          width={2}
                          height={60}
                          displayValue={true}
                          fontSize={12}
                          textAlign='center'
                          textPosition='bottom'
                          background='#ffffff'
                          lineColor='#000000'
                        />
                      </Box>
                      <Typography variant='body2' color='text.secondary' className='text-center'>
                        Use este código para pagamento via boleto bancário
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              )}
              {invoice.payload && <Grid size={{ xs: 12 }}></Grid>}
            </Grid>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Box className='flex justify-between flex-col gap-y-4 sm:flex-row'>
              <Box className='flex flex-col gap-1 order-2 sm:order-[unset]'>
                <Box className='flex items-center gap-2'>
                  <Typography className='font-medium' color='text.primary'>
                    ID Pagamento:
                  </Typography>
                  <Typography>{invoice.id}</Typography>
                </Box>
                <Typography>Obrigado por escolher nossos serviços!</Typography>
              </Box>

              <Box className='min-is-[200px]'>
                <Box className='flex items-center justify-between'>
                  <Typography>Subtotal:</Typography>
                  <Typography className='font-medium' color='text.primary'>
                    R$ {invoice.planvalue}
                  </Typography>
                </Box>
                <Box className='flex items-center justify-between'>
                  <Typography>Desconto:</Typography>
                  <Typography className='font-medium' color='text.primary'>
                    R$ 0,00
                  </Typography>
                </Box>
                <Box className='flex items-center justify-between'>
                  <Typography>Taxa:</Typography>
                  <Typography className='font-medium' color='text.primary'>
                    0%
                  </Typography>
                </Box>
                <Box className='mlb-2' />
                <Box className='flex items-center justify-between'>
                  <Typography>Total:</Typography>
                  <Typography className='font-medium' color='text.primary'>
                    R$ {invoice.planvalue}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Box className='border-dashed' />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Typography>
              <Typography component='span' className='font-medium' color='text.primary'>
                Observação:
              </Typography>{' '}
              Esta fatura foi gerada automaticamente. Em caso de dúvidas, entre em contato conosco. Agradecemos pela
              preferência!
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default PreviewCard
