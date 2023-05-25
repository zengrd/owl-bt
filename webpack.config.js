const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = (env, options) => {
  const isDev = options.mode === 'development';

  const config = {
    mode: options.mode,
    entry: [
      './src/client/index.js'
    ],
    output: {
      globalObject: 'this', // 添加这个选项
      path: path.resolve(__dirname, 'dist'),
      filename: 'bundle.[hash].js',
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          use: 'babel-loader',
        },
        {
          test: /\.css$/,
          use: [
            'style-loader',
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1,
                url: (url) => !url.includes('mCSB_buttons.png')// ignore for malihu-custom-scrollbar-plugin
              }
            },
            // 'postcss-loader' - nope css are only third party
          ]
        },
        {
          test: /\.scss$/,
          use: [
            'style-loader',
            'css-loader',
            'postcss-loader',
            'sass-loader'
          ]
        },
        {
          test: /\.html$/i,
          use: [
            'html-loader',
          ]
        },
        //{ test: require.resolve('jquery-mousewheel'), loader: "imports-loader?define=>false&this=>window" },
        //{ test: require.resolve('malihu-custom-scrollbar-plugin'), loader: "imports-loader?define=>false&this=>window" },

        { 
          test: require.resolve('jquery-mousewheel'), 
          use: [
            {
              loader: 'imports-loader',
              options: {
                wrapper: 'this.window',
                additionalCode:
                'var define = false; /* Disable AMD for misbehaving libraries */',
              },
            }
          ]
        },
        {
          test: require.resolve('malihu-custom-scrollbar-plugin'),
          use: [
            {
              loader: 'imports-loader',
              options: {
                wrapper: 'this.window',
                additionalCode:
                'var define = false; /* Disable AMD for misbehaving libraries */',
              },
            }
          ]
        }
      ],
    },
    plugins: [
      new webpack.ProvidePlugin({ // https://webpack.js.org/plugins/provide-plugin/#usage-jquery-with-angular-1
        'window.jQuery': 'jquery',
        $: 'jquery',
        jQuery: 'jquery',
      }),
      new HtmlWebpackPlugin({
        template: './src/client/index.html',
        filename: 'index.html'
      }),
    ]
  };

  if (isDev) {
    config.entry.push('webpack-hot-middleware/client?reload=true'); // reload=true -> we are not supporting real HMR, but auto reload is nice also :)
    config.plugins.push(new webpack.HotModuleReplacementPlugin());
    config.devtool = 'inline-source-map';
  } else {
    config.plugins.push(new CleanWebpackPlugin());
    config.plugins.push(new webpack.SourceMapDevToolPlugin({
      filename: '[file].map',
    }));
  }

  return config;
}