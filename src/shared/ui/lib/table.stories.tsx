import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from './table';

type Invoice = { id: string; status: string; method: string; amount: string };

const INVOICES: Invoice[] = [
  { id: 'INV001', status: 'Paid', method: 'Credit Card', amount: '$250.00' },
  { id: 'INV002', status: 'Pending', method: 'PayPal', amount: '$150.00' },
  { id: 'INV003', status: 'Unpaid', method: 'Bank Transfer', amount: '$350.00' },
];

const renderTable = (rows: Invoice[], footer?: string) => (
  <>
    <TableCaption>Recent invoices</TableCaption>
    <TableHeader>
      <TableRow>
        <TableHead>Invoice</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Method</TableHead>
        <TableHead className="text-right">Amount</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {rows.length === 0 ? (
        <TableRow>
          <TableCell colSpan={4} className="h-24 text-center">
            No invoices found.
          </TableCell>
        </TableRow>
      ) : (
        rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="font-medium">{row.id}</TableCell>
            <TableCell>{row.status}</TableCell>
            <TableCell>{row.method}</TableCell>
            <TableCell className="text-right">{row.amount}</TableCell>
          </TableRow>
        ))
      )}
    </TableBody>
    {footer && (
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Total</TableCell>
          <TableCell className="text-right">{footer}</TableCell>
        </TableRow>
      </TableFooter>
    )}
  </>
);

const meta = {
  component: Table,
  tags: ['ai-generated'],
  args: { children: renderTable(INVOICES) },
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    const table = canvas.getByRole('table', { name: 'Recent invoices' });
    await expect(table).toBeVisible();
    await expect(canvas.getAllByRole('columnheader')).toHaveLength(4);
    // 헤더 1행 + 데이터 3행
    await expect(canvas.getAllByRole('row')).toHaveLength(4);
    await expect(canvas.getByRole('cell', { name: 'INV002' })).toBeVisible();
  },
};

export const Empty: Story = {
  args: { children: renderTable([]) },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('cell', { name: 'No invoices found.' })).toBeVisible();
    await expect(canvas.getAllByRole('row')).toHaveLength(2);
  },
};

export const SingleRow: Story = {
  args: { children: renderTable(INVOICES.slice(0, 1)) },
};

export const WithFooter: Story = {
  args: { children: renderTable(INVOICES, '$750.00') },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('cell', { name: '$750.00' })).toBeVisible();
  },
};

export const ManyRows: Story = {
  args: {
    children: renderTable(
      Array.from({ length: 20 }, (_, i) => ({
        id: `INV${String(i + 1).padStart(3, '0')}`,
        status: i % 2 ? 'Paid' : 'Pending',
        method: 'Credit Card',
        amount: `$${(i + 1) * 10}.00`,
      })),
    ),
  },
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('row')).toHaveLength(21);
  },
};
