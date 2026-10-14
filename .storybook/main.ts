import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@chromatic-com/storybook',
    '@storybook/addon-vitest',
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
    '@storybook/addon-mcp',
  ],
  framework: '@storybook/react-vite',
  // cva 의 VariantProps 같은 파생 타입까지 풀어 Controls 를 자동 생성하기 위함
  typescript: {
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      // 루트 tsconfig.json 은 files: [] + references 구조라 소스가 포함된 쪽을 직접 지정
      tsconfigPath: './tsconfig.app.json',
      shouldExtractLiteralValuesFromEnum: true,
      shouldRemoveUndefinedFromOptional: true,
      // 기본 필터는 node_modules 에서 온 props 를 모두 버리는데, VariantProps 는 class-variance-authority 에 정의돼 있어 같이 사라진다
      propFilter: (prop) =>
        prop.parent
          ? !/node_modules\/(?!class-variance-authority)/.test(prop.parent.fileName)
          : true,
    },
  },
};
export default config;
