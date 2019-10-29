import Reactotron from "reactotron-react-native"

const reactron = Reactotron
  .configure({
    name: "App",
    host: "192.168.1.104",
    onConnect: ()=>{
        Reactotron.clear();
        reactron.clear();
    }
  }) // controls connection & communication settings
  .useReactNative() // add all built-in react native plugins
reactron.connect()

