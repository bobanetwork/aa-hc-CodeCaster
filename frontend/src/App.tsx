import NetworkAlert from "@/components/AccountAlert";
import Navbar from "@/components/Navbar";
import "./App.css";
import Alert from "./components/Alert";
//import FormComponent from "./components/FormComponent";
// import ResultComponent from './components/ResultComponent'
import { MetaMaskProvider } from "./hooks/MetamaskContext";
import "./styles/global.css";
import Footer from "./components/Footer";
import { ChatBox } from "./components/ChatBox";
function App() {
  return (
    <>
      <MetaMaskProvider>
        <div className="min-h-screen">
          <div className="header">
            <Navbar />
            <Alert />
          </div>
          <NetworkAlert />
          <ChatBox />
          {/*<FormComponent /> */}
          {/* <ResultComponent /> */}
          <Footer />
        </div>
      </MetaMaskProvider>
    </>
  );
}

export default App;
