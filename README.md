# image-to-react-component

> Automatically convert an image or svg into a react component

## Install

```sh
npm i image-to-react-component --save-dev
```

## Usage

```js
import ImageToReactComponent from 'image-to-react-component';
// If you use CommonJS (i.e NodeJS environment), it should be:
// const { ImageToReactComponent } = require('image-to-react-component').default;

const isDev = process.env.NODE_ENV === 'development';

if (isDev) {
  const imageToReactComponent = new ImageToReactComponent({
    input: path.resolve(__dirname, 'src/assets'),
    output: path.resolve(__dirname, 'src/components/Images'),
    extensions: ['.png', '.jpg', '.jpeg', '.svg'],
    factor: true,
    prettierConfigPath: './.prettierrc.cjs',
    useNextImage: true,
  });

  imageToReactComponent.init();
}
```

## License

MIT © zhiyingzzhou
