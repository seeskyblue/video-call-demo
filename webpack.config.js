/* eslint-disable compat/compat */
const nodePath = require('path');

const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const base = __dirname;
const src = nodePath.resolve(base, 'src');
const build = nodePath.resolve(base, 'build');
const content = nodePath.resolve(base, 'public');
const path = { base, src, content, build };

const protocol = 'http:';
const host = '127.0.0.1';
const port = 3030;
const config = { protocol, host, port };

function createDevprod(env = 'production') {
  return function devprod(dev, prod) {
    return env === 'production' ? prod : dev;
  };
}

module.exports = function webpackConfig(env = {}) {
  const devprod = createDevprod(env.NODE_ENV);

  return {
    mode: devprod('development', 'production'),

    context: path.base,

    devtool: devprod('module-source-map', 'hidden-cheap-module-source-map'),

    entry: ['./src/index.tsx'],

    output: {
      path: devprod(path.dist, path.build),
      filename: `[name].js`,
      chunkFilename: `[name].[contenthash].js`,
      publicPath: '/',
    },

    optimization: {
      minimizer: [new TerserJSPlugin({}), new OptimizeCSSAssetsPlugin({})],
      runtimeChunk: devprod(undefined, 'single'),
      splitChunks: {
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      },
    },

    devServer: devprod({
      contentBase: path.content,
      historyApiFallback: true,
      host: config.host,
      hot: true,
      overlay: true,
      port: config.port,
      // useLocalIp: true,
    }),

    module: {
      rules: [
        {
          test: /\.(bmp|gif|jpe?g|png|svg)$/,
          loader: 'url-loader',
          options: {
            limit: 10000,
            name: 'static/media/[name].[contenthash:8].[ext]',
          },
        },
        {
          test: /\.(js|jsx|ts|tsx)$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
        },
        {
          test: /\.css$/,
          include: /node_modules/,
          use: [devprod('style-loader', { loader: MiniCssExtractPlugin.loader }), 'css-loader'],
        },
        {
          test: /\.less$/,
          include: /node_modules/,
          use: [
            devprod('style-loader', { loader: MiniCssExtractPlugin.loader }),
            'css-loader',
            {
              loader: 'less-loader',
              options: {
                sourceMap: true,
                lessOptions: {
                  javascriptEnabled: true,
                },
              },
            },
          ],
        },
        {
          test: /\.less$/,
          exclude: /node_modules/,
          use: [
            devprod('style-loader', { loader: MiniCssExtractPlugin.loader }),
            {
              loader: 'css-loader',
              options: {
                sourceMap: true,
                import: false,
                modules: {
                  localIdentName: '[name]_[local]__[hash:base64:5]',
                },
                importLoaders: 1,
              },
            },
            {
              loader: 'less-loader',
              options: {
                sourceMap: true,
                lessOptions: {
                  javascriptEnabled: true,
                },
              },
            },
          ],
        },
      ],
    },

    plugins: [
      new webpack.DefinePlugin({
        __DEVELOPMENT__: devprod(true, false),
      }),
      new webpack.HashedModuleIdsPlugin(),
      new MiniCssExtractPlugin({
        filename: `[name].[contenthash].css`,
        chunkFilename: `[name].[contenthash].css`,
      }),
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        inject: true,
        template: nodePath.resolve(path.content, 'index.html'),
      }),
    ],

    resolve: {
      alias: { '~': path.src },
      modules: ['node_modules'],
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    },
  };
};
