/** @type {import('next').NextConfig} */
import { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
    typedRoutes: true,
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
