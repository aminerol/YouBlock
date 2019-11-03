import Reactotron, { asyncStorage } from "reactotron-react-native"

const reactron = Reactotron
  .configure({
    name: "App",
    host: "192.168.1.105",
    onConnect: ()=>{
        Reactotron.clear();
        reactron.clear();
    }
  }) // controls connection & communication settings
  .useReactNative() // add all built-in react native plugins
  .use(asyncStorage())
reactron.connect()

