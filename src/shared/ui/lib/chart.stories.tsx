import type { Meta, StoryObj } from '@storybook/react-vite';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import { expect } from 'storybook/test';
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from './chart';

const DATA = [
  { month: 'January', desktop: 186, mobile: 80 },
  { month: 'February', desktop: 305, mobile: 200 },
  { month: 'March', desktop: 237, mobile: 120 },
  { month: 'April', desktop: 73, mobile: 190 },
  { month: 'May', desktop: 209, mobile: 130 },
  { month: 'June', desktop: 214, mobile: 140 },
];

const CONFIG = {
  desktop: { label: 'Desktop', color: 'var(--chart-1)' },
  mobile: { label: 'Mobile', color: 'var(--chart-2)' },
} satisfies ChartConfig;

const xAxis = (
  <XAxis
    dataKey="month"
    tickLine={false}
    axisLine={false}
    tickMargin={8}
    tickFormatter={(value: string) => value.slice(0, 3)}
  />
);

const meta = {
  component: ChartContainer,
  tags: ['ai-generated'],
  decorators: [
    (Story) => (
      <div className="w-[480px]">
        <Story />
      </div>
    ),
  ],
  args: {
    config: CONFIG,
    children: (
      <BarChart data={DATA}>
        <CartesianGrid vertical={false} />
        {xAxis}
        <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} isAnimationActive={false} />
        <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} isAnimationActive={false} />
      </BarChart>
    ),
  },
} satisfies Meta<typeof ChartContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    // x축 tick 은 tickFormatter 로 세 글자만 표시된다
    await expect(await canvas.findByText('Jan')).toBeVisible();
    await expect(canvas.getByText('Jun')).toBeVisible();
  },
};

export const WithLegend: Story = {
  args: {
    children: (
      <BarChart data={DATA}>
        <CartesianGrid vertical={false} />
        {xAxis}
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} isAnimationActive={false} />
        <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} isAnimationActive={false} />
      </BarChart>
    ),
  },
  play: async ({ canvas }) => {
    // 범례 라벨은 config 의 label 에서 온다
    await expect(await canvas.findByText('Desktop')).toBeVisible();
    await expect(canvas.getByText('Mobile')).toBeVisible();
  },
};

export const TooltipOnKeyboardFocus: Story = {
  args: {
    children: (
      <BarChart data={DATA} accessibilityLayer>
        <CartesianGrid vertical={false} />
        {xAxis}
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} isAnimationActive={false} />
        <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} isAnimationActive={false} />
      </BarChart>
    ),
  },
  play: async ({ canvas, userEvent }) => {
    await canvas.findByText('Jan');
    await expect(canvas.queryByText('January')).not.toBeInTheDocument();

    // accessibilityLayer: 차트에 포커스하면 첫 데이터 포인트의 툴팁이 열린다
    await userEvent.tab();
    await expect(await canvas.findByText('January')).toBeVisible();
    await expect(canvas.getByText('186')).toBeVisible();
    await expect(canvas.getByText('80')).toBeVisible();

    // 방향키로 다음 데이터 포인트로 이동한다
    await userEvent.keyboard('{ArrowRight}');
    await expect(await canvas.findByText('February')).toBeVisible();
    await expect(canvas.getByText('305')).toBeVisible();
    await expect(canvas.queryByText('January')).not.toBeInTheDocument();
  },
};

export const TooltipLineIndicator: Story = {
  args: {
    children: (
      <AreaChart data={DATA} accessibilityLayer>
        <CartesianGrid vertical={false} />
        {xAxis}
        <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
        <Area
          dataKey="desktop"
          type="natural"
          fill="var(--color-desktop)"
          fillOpacity={0.4}
          stroke="var(--color-desktop)"
          isAnimationActive={false}
        />
      </AreaChart>
    ),
  },
  play: async ({ canvas, userEvent }) => {
    // AreaChart 는 첫 tick(Jan)이 가장자리에서 생략될 수 있어 마지막 tick 으로 렌더링을 기다린다
    await canvas.findByText('Jun');
    await userEvent.tab();
    // 단일 series + line indicator 는 라벨이 항목 안에 중첩된다
    await expect(await canvas.findByText('January')).toBeVisible();
    await expect(canvas.getByText('186')).toBeVisible();
  },
};

export const ThemedColors: Story = {
  args: {
    config: {
      desktop: { label: 'Desktop', theme: { light: '#2563eb', dark: '#60a5fa' } },
      mobile: { label: 'Mobile', theme: { light: '#16a34a', dark: '#4ade80' } },
    },
  },
};
