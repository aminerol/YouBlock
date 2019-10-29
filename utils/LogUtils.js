import Reactotron from 'reactotron-react-native';

export default class LogUtils {
    static log(message, ...args) {
      Reactotron.display({
        name: 'LOG',
        preview: message,
        value: { message, args },
      });
    }
    static info(message, ...args) {
        Reactotron.display({
            name: "INFO",
            preview: message,
            value: { message, args },
        });
    }
    static warn(message, ...args) {
      Reactotron.display({
        name: 'WARN',
        preview: message,
        value: { message, args },
        important: true,
      });
    }
    static error(message, ...args) {
      Reactotron.display({
        name: 'ERROR',
        preview: message,
        value: { message, args },
        important: true,
      });
    }
  }