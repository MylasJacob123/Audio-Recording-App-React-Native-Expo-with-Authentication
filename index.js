import { registerRootComponent } from 'expo';
import { Provider } from 'react-redux';
import { AppRegistry } from "react-native";
import store from "./redux/store";
import App from './App';

// Root Component with Redux Provider
const Root = () => (
  <Provider store={store}>
    <App />
  </Provider>
);

// Register Root Component
registerRootComponent(Root);

