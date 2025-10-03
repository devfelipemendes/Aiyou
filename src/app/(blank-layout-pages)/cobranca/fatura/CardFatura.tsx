import React from 'react'

import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Divider,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Stack
} from '@mui/material'

type InvoiceItem = {
  description: string
  quantity: number
  unitPrice: number
  total: number
}

type InvoiceProps = {
  invoiceId: string
  customer: {
    name: string
    document: string
    email: string
  }
  subscription: {
    plan: string
    period: string
    dueDate: string
    status: 'open' | 'paid' | 'overdue'
  }
  items: InvoiceItem[]
  totals: {
    subtotal: number
    discount: number
    taxes: number
    total: number
  }
}

const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const InvoiceCard: React.FC<{ data: InvoiceProps }> = ({ data }) => {
  return (
    <Card sx={{ maxWidth: 700, mx: 'auto', mt: 4, boxShadow: 4 }}>
      <CardHeader
        title={`Fatura #${data.invoiceId}`}
        subheader={`Vencimento: ${new Date(data.subscription.dueDate).toLocaleDateString('pt-BR')}`}
      />
      <CardContent>
        {/* Dados do cliente */}
        <Box mb={2}>
          <Typography variant='h6'>Cliente</Typography>
          <Typography>{data.customer.name}</Typography>
          <Typography>{data.customer.document}</Typography>
          <Typography color='text.secondary'>{data.customer.email}</Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Plano / Período */}
        <Box mb={2}>
          <Typography variant='h6'>Assinatura</Typography>
          <Typography>{data.subscription.plan}</Typography>
          <Typography>Período: {data.subscription.period}</Typography>
          <Typography>Status: {data.subscription.status}</Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Itens da fatura */}
        <Typography variant='h6' gutterBottom>
          Itens da Fatura
        </Typography>
        <Table size='small'>
          <TableHead>
            <TableRow>
              <TableCell>Descrição</TableCell>
              <TableCell align='right'>Qtd</TableCell>
              <TableCell align='right'>Unitário</TableCell>
              <TableCell align='right'>Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.items.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.description}</TableCell>
                <TableCell align='right'>{item.quantity}</TableCell>
                <TableCell align='right'>{formatCurrency(item.unitPrice)}</TableCell>
                <TableCell align='right'>{formatCurrency(item.total)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Totais */}
        <Box mt={2}>
          <Stack spacing={0.5}>
            <Typography>Subtotal: {formatCurrency(data.totals.subtotal)}</Typography>
            {data.totals.discount > 0 && <Typography>Desconto: -{formatCurrency(data.totals.discount)}</Typography>}
            {data.totals.taxes > 0 && <Typography>Impostos: {formatCurrency(data.totals.taxes)}</Typography>}
            <Typography variant='h6' color='primary'>
              Total: {formatCurrency(data.totals.total)}
            </Typography>
          </Stack>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Ações de pagamento */}
        <Typography variant='h6' gutterBottom>
          Formas de Pagamento
        </Typography>
        <Stack direction='row' spacing={2}>
          <Button variant='contained' color='success'>
            Pagar com PIX
          </Button>
          <Button variant='outlined'>Baixar Boleto</Button>
          <Button variant='outlined' color='primary'>
            Pagar com Cartão
          </Button>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default InvoiceCard
